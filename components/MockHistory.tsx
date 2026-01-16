import React from 'react';
import { MockExamResult, IeLtsScore } from '../types';

interface MockHistoryProps {
  history: MockExamResult[];
  onStartNew: () => void;
}

const MockHistory: React.FC<MockHistoryProps> = ({ history, onStartNew }) => {

  const getAverageScore = (exam: MockExamResult, dimension: keyof IeLtsScore) => {
    // Safely access nested dimensions. 
    // Fallback to 0 if data is missing to prevent crash.
    const s1 = exam.parts?.part1?.dimensions?.[dimension] || 0;
    const s2 = exam.parts?.part2?.dimensions?.[dimension] || 0;
    const s3 = exam.parts?.part3?.dimensions?.[dimension] || 0;
    
    // If scores are 0, just return -
    if (s1 === 0 && s2 === 0 && s3 === 0) return "-";
    
    return ((s1 + s2 + s3) / 3).toFixed(1);
  };

  const getSummary = (exam: MockExamResult) => {
    const w = exam.weakestPart ? exam.weakestPart.toLowerCase() : 'part 1';
    if (w.includes('part 2') || w.includes('part2')) return exam.parts?.part2?.analysis || "Analysis unavailable";
    if (w.includes('part 3') || w.includes('part3')) return exam.parts?.part3?.analysis || "Analysis unavailable";
    return exam.parts?.part1?.analysis || "Analysis unavailable";
  };

  return (
    <div className="max-w-5xl mx-auto p-8 animate-in fade-in">
       <div className="flex justify-between items-end mb-8">
           <div>
               <h1 className="text-3xl font-bold text-slate-900">Mock Exam History</h1>
               <p className="text-slate-500 mt-1">Track your progress over time.</p>
           </div>
           <button 
             onClick={onStartNew}
             className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
           >
             <span className="text-xl">+</span> New Mock Exam
           </button>
       </div>

       {history.length === 0 ? (
           <div className="text-center py-20 bg-slate-100 rounded-2xl border border-dashed border-slate-300">
               <p className="text-slate-500 mb-4">No mock exams taken yet.</p>
               <button onClick={onStartNew} className="text-blue-600 font-medium hover:underline">Start your first exam now</button>
           </div>
       ) : (
           <div className="grid gap-6">
               {history.map((exam, idx) => (
                   <div key={exam.id || idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                       <div className="flex justify-between items-start mb-4">
                           <div>
                               <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{exam.date}</div>
                               <h3 className="text-lg font-bold text-slate-800">Full Mock Simulation</h3>
                           </div>
                           <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-700 font-bold text-xl border border-blue-100">
                               {exam.overallScore.toFixed(1)}
                           </div>
                       </div>
                       
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                           <div className="text-center p-2 bg-slate-50 rounded">
                               <div className="text-xs text-slate-500">Fluency</div>
                               <div className="font-bold text-slate-700">{getAverageScore(exam, 'fluencyCoherence')}</div>
                           </div>
                           <div className="text-center p-2 bg-slate-50 rounded">
                               <div className="text-xs text-slate-500">Lexical</div>
                               <div className="font-bold text-slate-700">{getAverageScore(exam, 'lexicalResource')}</div>
                           </div>
                           <div className="text-center p-2 bg-slate-50 rounded">
                               <div className="text-xs text-slate-500">Grammar</div>
                               <div className="font-bold text-slate-700">{getAverageScore(exam, 'grammaticalRange')}</div>
                           </div>
                           <div className="text-center p-2 bg-slate-50 rounded">
                               <div className="text-xs text-slate-500">Pronunciation</div>
                               <div className="font-bold text-slate-700">{getAverageScore(exam, 'pronunciation')}</div>
                           </div>
                       </div>

                       <div className="border-t border-slate-100 pt-4">
                           <p className="text-sm text-slate-600 mb-2"><span className="font-bold text-red-500">Weakest Area:</span> {exam.weakestPart}</p>
                           <p className="text-sm text-slate-500 line-clamp-2">{getSummary(exam)}</p>
                       </div>
                   </div>
               ))}
           </div>
       )}
    </div>
  );
};

export default MockHistory;
