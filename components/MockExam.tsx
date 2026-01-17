
import React, { useState, useEffect, useRef } from 'react';
import { MockQuestion, IeLtsPart } from '../types';
import Recorder from './Recorder';
import { convertTextToSpeech } from '../services/geminiService';

interface MockExamProps {
  questions: MockQuestion[];
  onFinish: (blobs: Blob[]) => void;
  onExit: () => void;
}

type ExamStage = 'intro' | 'part1' | 'part2-intro' | 'part2-prep' | 'part2-answer' | 'part3-intro' | 'part3' | 'completed';

const MockExam: React.FC<MockExamProps> = ({ questions, onFinish, onExit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [stage, setStage] = useState<ExamStage>('intro');
  const [prepTimeLeft, setPrepTimeLeft] = useState(0);
  const [recordings, setRecordings] = useState<Blob[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false); // Examiner speaking state
  
  const [isTextVisible, setIsTextVisible] = useState(false);
  
  const part1Qs = questions.filter(q => q.part === IeLtsPart.Part1);
  const part2Q = questions.find(q => q.part === IeLtsPart.Part2);
  const activeQuestion = questions[currentQuestionIndex];
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    setIsTextVisible(false);
  }, [currentQuestionIndex, stage]);

  const speakPrompt = async (text: string) => {
    setIsSpeaking(true);
    try {
        await convertTextToSpeech(text);
    } catch (e) {
        console.error("TTS Failed", e);
    } finally {
        setIsSpeaking(false);
    }
  };

  const startExam = () => {
    setStage('part1');
    setCurrentQuestionIndex(0); 
    speakPrompt("Let's talk about " + part1Qs[0].title);
  };

  const nextQuestion = () => {
    const nextIdx = currentQuestionIndex + 1;
    
    if (stage === 'part1') {
      const p1StartIndex = questions.findIndex(q => q.part === IeLtsPart.Part1);
      const p1EndIndex = p1StartIndex + part1Qs.length;
      
      if (nextIdx < p1EndIndex) {
        setCurrentQuestionIndex(nextIdx);
        speakPrompt(questions[nextIdx].title);
      } else {
        setStage('part2-intro');
        speakPrompt("Now, I'm going to give you a topic and I'd like you to talk about it for one to two minutes. You have one minute to think about what you are going to say.");
      }
    } 
    else if (stage === 'part2-intro') {
      setStage('part2-prep');
      if (part2Q) setCurrentQuestionIndex(questions.indexOf(part2Q));
      setPrepTimeLeft(60);
      timerRef.current = window.setInterval(() => {
        setPrepTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            startPart2Recording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    else if (stage === 'part2-answer') {
      setStage('part3-intro');
      speakPrompt("We've been talking about " + part2Q?.title + ". Now I'd like to ask you some more general questions related to this.");
    }
    else if (stage === 'part3-intro') {
      setStage('part3');
      const p3Start = questions.findIndex(q => q.part === IeLtsPart.Part3);
      setCurrentQuestionIndex(p3Start);
      speakPrompt(questions[p3Start].title);
    }
    else if (stage === 'part3') {
      if (nextIdx < questions.length) {
        setCurrentQuestionIndex(nextIdx);
        speakPrompt(questions[nextIdx].title);
      } else {
        setStage('completed');
      }
    }
  };

  const startPart2Recording = () => {
    setStage('part2-answer');
    speakPrompt("Please start speaking now.");
  };

  const handleRecordingComplete = (blob: Blob) => {
    setRecordings(prev => [...prev, blob]);
    setTimeout(() => {
        if (stage === 'completed' || (stage === 'part3' && currentQuestionIndex === questions.length - 1)) {
            setStage('completed');
            onFinish([...recordings, blob]);
        } else {
            nextQuestion();
        }
    }, 500);
  };

  // Virtual Examiner Visual
  const ExaminerVisual = () => (
      <div className="flex flex-col items-center justify-center mb-6">
           <div className={`w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center shadow-lg transition-all ${isSpeaking ? 'ring-4 ring-blue-400 scale-105' : ''}`}>
               {isSpeaking ? (
                   <div className="flex gap-1 items-end h-8">
                       <div className="w-1 bg-white animate-[bounce_1s_infinite] h-4"></div>
                       <div className="w-1 bg-white animate-[bounce_1.2s_infinite] h-8"></div>
                       <div className="w-1 bg-white animate-[bounce_0.8s_infinite] h-6"></div>
                       <div className="w-1 bg-white animate-[bounce_1.1s_infinite] h-8"></div>
                       <div className="w-1 bg-white animate-[bounce_1s_infinite] h-4"></div>
                   </div>
               ) : (
                   <span className="text-4xl">👨‍🏫</span>
               )}
           </div>
           <p className="mt-2 text-sm font-bold text-slate-500">{isSpeaking ? "Examiner is speaking..." : "Examiner is listening"}</p>
      </div>
  );

  // Improved Progress Bar
  const renderProgress = () => {
      // Determine filled state based on index
      // Part 1: First X questions
      // Part 2: 1 Question
      // Part 3: Last Y questions
      const p1Count = part1Qs.length;
      const p3Count = questions.length - p1Count - 1; // -1 for P2

      const renderDots = (count: number, startIndex: number) => {
          return Array.from({length: count}).map((_, i) => (
             <div key={i} className={`w-2.5 h-2.5 rounded-full mx-0.5 ${currentQuestionIndex >= (startIndex + i) ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
          ));
      };

      return (
          <div className="w-full mb-8 flex justify-between items-center bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100">
              <div className="flex flex-col items-center">
                  <span className={`text-[10px] font-bold uppercase mb-1 ${stage === 'part1' ? 'text-blue-600' : 'text-slate-400'}`}>Part 1</span>
                  <div className="flex">{renderDots(p1Count, 0)}</div>
              </div>
              <div className="w-8 h-[1px] bg-slate-200"></div>
              <div className="flex flex-col items-center">
                  <span className={`text-[10px] font-bold uppercase mb-1 ${stage.includes('part2') ? 'text-blue-600' : 'text-slate-400'}`}>Part 2</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${stage.includes('part2') || stage.includes('part3') || stage === 'completed' ? 'border-blue-600 bg-blue-600' : 'border-slate-200'}`}>
                      {(stage.includes('part2') || stage.includes('part3') || stage === 'completed') && <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                  </div>
              </div>
              <div className="w-8 h-[1px] bg-slate-200"></div>
              <div className="flex flex-col items-center">
                  <span className={`text-[10px] font-bold uppercase mb-1 ${stage.includes('part3') ? 'text-blue-600' : 'text-slate-400'}`}>Part 3</span>
                  <div className="flex">{renderDots(p3Count, p1Count + 1)}</div>
              </div>
          </div>
      );
  };

  // Control Bar for Visibility
  const renderControls = () => (
      <div className="absolute top-0 right-0 p-4 z-10">
        <button 
            onClick={() => setIsTextVisible(!isTextVisible)}
            className={`p-2 rounded-full transition-colors shadow-sm ${isTextVisible ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-white'}`}
            title={isTextVisible ? "Hide Text" : "Show Text"}
        >
            {isTextVisible ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
            ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.742L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>
            )}
        </button>
      </div>
  );

  if (stage === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-6">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Full Mock Exam</h2>
        <p className="text-slate-600 max-w-md">
          Part 1 (Interview) → Part 2 (Cue Card) → Part 3 (Discussion).
          <br/><strong>Cannot pause. Cannot retake.</strong>
        </p>
        <div className="flex gap-4">
           <button onClick={onExit} className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50">Cancel</button>
           <button onClick={startExam} className="px-8 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg transform hover:scale-105 transition-all">Start Exam</button>
        </div>
      </div>
    );
  }

  if (stage === 'part2-prep') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 relative">
        {renderControls()}
        {renderProgress()}
        <ExaminerVisual />
        <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-lg border border-slate-200 mb-8">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">Part 2 Topic</h3>
          <h2 className={`text-2xl font-bold text-slate-900 mb-4 transition-all duration-300 ${isTextVisible ? '' : 'blur-md select-none opacity-50'}`}>
              {activeQuestion.title}
          </h2>
          <div className={`text-slate-600 whitespace-pre-line bg-slate-50 p-4 rounded-lg border border-slate-100 transition-all duration-300 ${isTextVisible ? '' : 'blur-md select-none opacity-50'}`}>
            {activeQuestion.description}
          </div>
        </div>
        <div className="text-center">
            <p className="text-slate-500 mb-2 font-medium">Preparation Time Remaining</p>
            <div className="text-6xl font-mono font-bold text-blue-600">{prepTimeLeft}s</div>
        </div>
        <button onClick={startPart2Recording} className="mt-8 px-6 py-2 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 font-medium">Skip Timer</button>
      </div>
    );
  }

  if (stage === 'part2-intro' || stage === 'part3-intro') {
      return (
          <div className="flex flex-col items-center justify-center h-full">
               <ExaminerVisual />
               <h2 className="text-2xl font-bold text-slate-800 animate-pulse">Examiner is speaking...</h2>
          </div>
      )
  }

  if (stage === 'completed') {
      return (
       <div className="flex flex-col items-center justify-center h-full text-center p-8">
           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-6"></div>
           <h2 className="text-2xl font-bold text-slate-900 mb-2">Uploading Answers...</h2>
           <p className="text-slate-500">Please wait while we process your exam.</p>
       </div>
      )
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-6 relative">
      {renderControls()}
      {renderProgress()}
      
      <div className="flex flex-col items-center">
          <ExaminerVisual />
          <h2 className={`text-2xl font-bold text-slate-900 mt-2 text-center transition-all duration-300 ${isTextVisible ? '' : 'blur-md select-none opacity-50'}`}>
             {activeQuestion.title}
          </h2>
      </div>
      
      {stage === 'part2-answer' && (
          <div className="my-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-yellow-800 text-center">
              Speak for 1-2 minutes.
          </div>
      )}

      <div className="flex-1 flex items-center justify-center">
        <Recorder 
            onRecordingComplete={handleRecordingComplete} 
            isProcessing={false} 
        />
      </div>
    </div>
  );
};

export default MockExam;
