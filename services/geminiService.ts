
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
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

// Robust Retry wrapper for 429 errors
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error.message?.includes('429') || error.status === 429 || error.message?.includes('quota');
    
    if (retries === 0 || !isRateLimit) throw error;
    
    console.warn(`Quota limit hit (429). Pausing for ${delay}ms before retry... (${retries} attempts left).`);
    await new Promise(resolve => setTimeout(resolve, delay));
    // Exponential backoff: 2s -> 4s -> 8s
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

  const bufferForFallback = bytes.buffer.slice(0);

  try {
     return await audioContext.decodeAudioData(bytes.buffer);
  } catch (e) {
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

  // Optimized text processing for natural flow
  const processedText = text
    .replace(/([.!?])\s/g, '$1 <break time="500ms"/> ') // Explicit pauses
    .replace(/,/g, ', <break time="200ms"/> '); 

  try {
    const base64Audio = await withRetry(async () => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: processedText }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: {
                    // Switched to 'Puck' for a more natural, deep, human-like examiner voice
                    prebuiltVoiceConfig: { voiceName: 'Puck' },
                  },
              },
            },
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    }, 2, 1000); // Fewer retries for TTS to keep it snappy, but still retry once

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
    // Fallback
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

  // Optimized prompt for Band 6.5 ("Achievable")
  const prompt = `
    Role: Professional IELTS Speaking Examiner. Topic: "${topic.title}" (${topic.part}).
    
    Instructions:
    1. TRANSCRIPT: Accurate word-for-word.
    2. SCORE: Strict grading (0-9). Average is 5.5-6.5.
    3. ANALYSIS: Highlight key errors (Grammar, Pronunciation).
    4. IMPROVEMENT: Generate ONE "Band 6.5" version. 
       - Criteria: Natural, grammatically correct, clear, and achievable. 
       - Avoid overly complex idioms or academic words. 
       - It should be a strong, standard answer that a good student can actually mimic.
    
    Output JSON (Minified):
    {
      "score": { "fluencyCoherence": 0, "lexicalResource": 0, "grammaticalRange": 0, "pronunciation": 0, "overall": 0 },
      "transcript": [
         { 
           "text": "word", 
           "types": [], 
           "gra": { "error": "bad grammar", "correction": "correction", "explanation": "brief reason" } | null,
           "lr": { "simple": "basic word", "better": ["better1", "better2"] } | null,
           "pr": { "ipa": "ipa", "error": true } | null
         }
      ],
      "improvedVersions": [
         {
           "band": 6.5,
           "text": "Full improved response text (Band 6.5 level)...",
           "analysis": { "fillers": [], "vocabulary": [], "reasoning": "Why this is a solid Band 6.5" },
           "audioText": "Text optimized for speech"
         }
      ],
      "part3Suggestions": ["Q1", "Q2", "Q3"], 
      "feedbackDetail": {
         "fluency": { "issues": [], "tips": [] },
         "lexical": { "betterWords": [], "tips": [] },
         "grammar": { "errors": [], "tips": [] },
         "pronunciation": { "mispronounced": [], "tips": [] }
      }
    }
  `;

  return withRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash', 
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
      
      return { ...result, timestamp: Date.now() } as EvaluationResult;
  }, 4, 3000); 
};

export const generateMockTest = async (): Promise<MockQuestion[]> => {
  const ai = getClient();
  const prompt = `
    Generate IELTS Speaking Mock Test. JSON: { "part1": string[], "part2": { "topic": "s", "bullets": "s" }, "part3": string[] }
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: { text: prompt },
        config: { responseMimeType: "application/json" }
    });

    const data = JSON.parse(response.text || '{}');
    const questions: MockQuestion[] = [];

    if (data.part1) data.part1.forEach((q: string, i: number) => questions.push({ id: `mock-p1-${i}`, part: IeLtsPart.Part1, title: q, durationLimit: 30 }));
    if (data.part2) questions.push({ id: `mock-p2`, part: IeLtsPart.Part2, title: data.part2.topic, description: data.part2.bullets, prepTime: 60, durationLimit: 120 });
    if (data.part3) data.part3.forEach((q: string, i: number) => questions.push({ id: `mock-p3-${i}`, part: IeLtsPart.Part3, title: q, durationLimit: 45 }));
    return questions;
  });
};

const evaluateMockPart = async (ai: GoogleGenAI, partName: string, questions: MockQuestion[], blobs: Blob[]): Promise<PartResult> => {
    const audioParts: any[] = [{ text: `Evaluate ${partName} strictly.` }];
    for (let i = 0; i < blobs.length; i++) {
        const b64 = await blobToBase64(blobs[i]);
        audioParts.push({ text: `Q: ${questions[i].title}` });
        audioParts.push({ inlineData: { mimeType: 'audio/webm', data: b64 } });
    }
    const prompt = `JSON Output: { "score": 0, "dimensions": { "fluencyCoherence": 0, "lexicalResource": 0, "grammaticalRange": 0, "pronunciation": 0, "overall": 0 }, "analysis": "summary", "improvements": [] }`;
    audioParts.push({ text: prompt });

    return withRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: { parts: audioParts },
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '{}') as PartResult;
    }, 4, 3000);
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
      const [p1Result, p2Result, p3Result] = await Promise.all([
         evaluateMockPart(ai, "Part 1", p1Qs, p1Blobs),
         evaluateMockPart(ai, "Part 2", p2Qs, p2Blobs),
         evaluateMockPart(ai, "Part 3", p3Qs, p3Blobs)
      ]);

      const overallRaw = (p1Result.score + p2Result.score + p3Result.score) / 3;
      const overallScore = Math.round(overallRaw * 2) / 2;

      const scores = [{ name: 'Part 1', score: p1Result.score }, { name: 'Part 2', score: p2Result.score }, { name: 'Part 3', score: p3Result.score }];
      const weakest = scores.sort((a,b) => a.score - b.score)[0].name;

      return {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(),
          overallScore,
          weakestPart: weakest,
          parts: { part1: p1Result, part2: p2Result, part3: p3Result },
          questions,
          performanceCurve: []
      };

  } catch (error) {
      console.error("Full Exam Evaluation Failed", error);
      throw error;
  }
}
