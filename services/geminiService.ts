
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { EvaluationResult, Topic, MockQuestion, IeLtsPart, MockExamResult, PartResult, IeLtsScore, ImprovedResponse, TranscriptToken } from "../types";

// --- Helpers ---

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const getClient = () => {
  // Use provided key for deployment, fallback to process.env if available
  const apiKey = "AIzaSyBRuSVtb_K-CKHCUbMsSPz015VXINYdOkY" || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

// Retry wrapper for network flakes
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0) throw error;
    console.warn(`API Call failed. Retrying... (${retries} attempts left). Error: ${error.message}`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

// --- TTS Service ---
let audioContext: AudioContext | null = null;

const decodeAudioData = async (base64Data: string): Promise<AudioBuffer> => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // IMPORTANT: decodeAudioData detaches the buffer. We must clone it if we want to use it in the catch block.
  const bufferForFallback = bytes.buffer.slice(0);

  try {
     return await audioContext.decodeAudioData(bytes.buffer);
  } catch (e) {
     // Use the clone here because bytes.buffer is likely detached
     const dataInt16 = new Int16Array(bufferForFallback);
     const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
     const channelData = buffer.getChannelData(0);
     for (let i = 0; i < dataInt16.length; i++) {
         channelData[i] = dataInt16[i] / 32768.0;
     }
     return buffer;
  }
};

export const convertTextToSpeech = async (text: string): Promise<void> => {
  const ai = getClient();

  // Pre-process text to sound more human-like with pauses
  const processedText = text
    .replace(/\n/g, '... ') 
    .replace(/([.!?])\s/g, '$1... ');

  try {
    const base64Audio = await withRetry(async () => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: processedText }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Aoede' },
                  },
              },
            },
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    });

    if (!base64Audio) throw new Error("No audio data returned");

    const buffer = await decodeAudioData(base64Audio);
    
    if (audioContext) {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
    }
  } catch (error) {
    console.error("TTS Error:", error);
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }
};

// --- Evaluation Services ---

export const evaluateAudio = async (
  audioBlob: Blob, 
  topic: Topic
): Promise<EvaluationResult> => {
  const ai = getClient();
  const base64Audio = await blobToBase64(audioBlob);

  // Optimized prompt for stricter scoring and faster response (limited bands)
  const prompt = `
    You are a strict, professional IELTS Speaking Examiner. Evaluate this response for: "${topic.title}" (${topic.part}).
    
    CRITICAL INSTRUCTIONS:
    1. SCORING: Be EXTREMELY STRICT. Follow official IELTS Band Descriptors closely. Do not inflate scores. Most average students score 5.5-6.5.
    2. SPEED: Keep the analysis concise and direct to ensure fast generation.
    3. IMPROVEMENTS: Generate improved versions ONLY for Band 6.0 and Band 7.0.
       - Band 6.0: Simple, everyday conversational language, correct grammar, direct answer, authentic feeling (avoid complex/academic words).
       - Band 7.0: Natural native flow, idiomatic vocabulary, complex structures, detailed elaboration.
    
    TASK 1: Transcribe the audio word-for-word.
    TASK 2: Analyze the transcript for highlights (LR, GRA, PR).
    TASK 3: Generate improved versions for Band 6.0 and 7.0.
    TASK 4: Suggest 3 Part 3 questions (only if Part 2).

    Output JSON STRICTLY matching this schema:
    {
      "score": { "fluencyCoherence": number, "lexicalResource": number, "grammaticalRange": number, "pronunciation": number, "overall": number },
      "transcript": [
         { 
           "text": string, 
           "types": string[], // "lr", "gra", "pr"
           "gra": { "error": string, "correction": string, "explanation": string } | null,
           "lr": { "simple": string, "better": string[] } | null,
           "pr": { "ipa": string, "error": boolean } | null
         }
      ],
      "improvedVersions": [
         {
           "band": number, // 6.0 or 7.0
           "text": string,
           "analysis": {
              "fillers": string[],
              "vocabulary": string[],
              "reasoning": string
           },
           "audioText": string
         }
      ],
      "part3Suggestions": string[],
      "feedbackDetail": {
         "fluency": { "issues": string[], "tips": string[] },
         "lexical": { "betterWords": [{ "original": string, "better": string, "reason": string }], "tips": string[] },
         "grammar": { "errors": [{ "error": string, "correction": string, "explanation": string }], "tips": string[] },
         "pronunciation": { "mispronounced": string[], "tips": string[] }
      }
    }
  `;

  return withRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: audioBlob.type || 'audio/webm', data: base64Audio } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      const result = JSON.parse(text);
      
      // Add timestamp
      return { ...result, timestamp: Date.now() } as EvaluationResult;
  });
};

export const generateMockTest = async (): Promise<MockQuestion[]> => {
  const ai = getClient();
  const prompt = `
    Generate a full IELTS Speaking Mock Test.
    JSON Output:
    {
      "part1": string[], 
      "part2": { "topic": string, "bullets": string }, 
      "part3": string[]
    }
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { text: prompt },
        config: { responseMimeType: "application/json" }
    });

    const data = JSON.parse(response.text || '{}');
    const questions: MockQuestion[] = [];

    if (data.part1) {
        data.part1.forEach((q: string, i: number) => {
        questions.push({ id: `mock-p1-${i}`, part: IeLtsPart.Part1, title: q, durationLimit: 30 });
        });
    }
    if (data.part2) {
        questions.push({
        id: `mock-p2`, part: IeLtsPart.Part2, title: data.part2.topic, description: data.part2.bullets, prepTime: 60, durationLimit: 120
        });
    }
    if (data.part3) {
        data.part3.forEach((q: string, i: number) => {
        questions.push({ id: `mock-p3-${i}`, part: IeLtsPart.Part3, title: q, durationLimit: 45 });
        });
    }
    return questions;
  });
};

// Helper for Mock Evaluation per Part
const evaluateMockPart = async (
    ai: GoogleGenAI, 
    partName: string, 
    questions: MockQuestion[], 
    blobs: Blob[]
): Promise<PartResult> => {
    
    const audioParts: any[] = [];
    audioParts.push({ text: `Evaluate these ${partName} responses.` });
    
    for (let i = 0; i < blobs.length; i++) {
        const b64 = await blobToBase64(blobs[i]);
        audioParts.push({ text: `Question: ${questions[i].title}` });
        audioParts.push({ inlineData: { mimeType: 'audio/webm', data: b64 } });
    }

    const prompt = `
      Evaluate these ${partName} responses according to STRICT IELTS Speaking criteria.
      
      INSTRUCTION: Be critical. Do not give high scores (8.0/9.0) unless the English is native-level perfect. Average is 6.0.
      
      JSON Schema:
      {
        "score": number,
        "dimensions": { "fluencyCoherence": number, "lexicalResource": number, "grammaticalRange": number, "pronunciation": number, "overall": number },
        "analysis": string,
        "improvements": string[]
      }
    `;
    audioParts.push({ text: prompt });

    return withRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: audioParts },
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '{}') as PartResult;
    }, 2);
};

export const evaluateMockTest = async (blobs: Blob[], questions: MockQuestion[]): Promise<MockExamResult> => {
  const ai = getClient();
  
  const p1Qs = questions.filter(q => q.part === IeLtsPart.Part1);
  const p2Qs = questions.filter(q => q.part === IeLtsPart.Part2);
  const p3Qs = questions.filter(q => q.part === IeLtsPart.Part3);

  let cursor = 0;
  const p1Blobs = blobs.slice(cursor, cursor + p1Qs.length); cursor += p1Qs.length;
  const p2Blobs = blobs.slice(cursor, cursor + p2Qs.length); cursor += p2Qs.length;
  const p3Blobs = blobs.slice(cursor, cursor + p3Qs.length);

  try {
      const p1Result = await evaluateMockPart(ai, "Part 1", p1Qs, p1Blobs);
      const p2Result = await evaluateMockPart(ai, "Part 2", p2Qs, p2Blobs);
      const p3Result = await evaluateMockPart(ai, "Part 3", p3Qs, p3Blobs);

      const overallRaw = (p1Result.score + p2Result.score + p3Result.score) / 3;
      const overallScore = Math.round(overallRaw * 2) / 2;

      const scores = [
          { name: 'Part 1', score: p1Result.score },
          { name: 'Part 2', score: p2Result.score },
          { name: 'Part 3', score: p3Result.score }
      ];
      const weakest = scores.sort((a,b) => a.score - b.score)[0].name;

      // Simulate fatigue data (real implementation would analyze sentence length/pauses over time)
      const performanceCurve = [
          { part: 'Start', fatigueLevel: 10, score: p1Result.score + 0.5 },
          { part: 'Part 1', fatigueLevel: 30, score: p1Result.score },
          { part: 'Part 2', fatigueLevel: 60, score: p2Result.score },
          { part: 'Part 3', fatigueLevel: 90, score: p3Result.score }
      ];

      return {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(),
          overallScore,
          weakestPart: weakest,
          parts: {
              part1: p1Result,
              part2: p2Result,
              part3: p3Result
          },
          questions,
          performanceCurve
      };

  } catch (error) {
      console.error("Full Exam Evaluation Failed", error);
      throw error;
  }
}
