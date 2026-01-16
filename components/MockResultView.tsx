
import React, { useState } from 'react';
import { MockExamResult, PartResult } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface MockResultViewProps {
  result: MockExamResult;
  onStartNew: () => void;
  previousResult?: MockExamResult;
}

const MockResultView: React.FC<MockResultViewProps> = ({ result, onStartNew, previousResult }) => {
  const [activeTab, setActiveTab] = useState<'part1' | 'part2' | 'part3'>('part1');

  // Helper component for small score box
  const ScoreBox = ({ label, score, color = 'blue' }: { label: string, score: number, color?: string }) => (
      <div className={`flex flex-col items-center p-3 bg-${color}-50 rounded-lg border border-${color}-100`}>
          <span className={`text-[10px] uppercase font-bold text-${color}-400 mb-1`}>{label}</span>
          <span className={`text-2xl font-bold text-${color}-700`}>{score ? score.toFixed(1) : '-'}</span>
      </div>
  );

  const renderPartDetail = (partData: PartResult, title: string) => {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                {title} Analysis
                <span className="text-sm font-normal text-slate-400 ml-2">Score: {partData.score}</span>
            </h3>

            {/* 4 Criteria Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <ScoreBox label="Fluency (FC)" score={partData.dimensions.fluencyCoherence} />
                <ScoreBox label="Lexical (LR)" score={partData.dimensions.lexicalResource} color="indigo" />
                <ScoreBox label="Grammar (GRA)" score={partData.dimensions.grammaticalRange} color="rose" />
                <ScoreBox label="Pronunciation" score={partData.dimensions.pronunciation} color="yellow" />
            </div>

            {/* Analysis Text */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <h4 className="font-bold text-slate-700 mb-3">Examiner Feedback</h4>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {partData.analysis}
                </p>
            </div>

            {/* Improvements */}
            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                 <h4 className="font-bold text-green-800 mb-3">Key Improvements</h4>
                 <ul className="space-y-2">
                     {partData.improvements.map((imp, idx) => (
                         <li key={idx} className="flex gap-2 text-sm text-green-700">
                             <span>•</span>
                             {imp}
                         </li>
                     ))}
                 </ul>
            </div>
        </div>
      );
  };

  const diff = previousResult ? result.overallScore - previousResult.overallScore : 0;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in">
       
       {/* 1. Header & Overall Score */}
       <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <div className="text-center md:text-left mb-4 md:mb-0">
               <h1 className="text-2xl font-bold text-slate-900">Exam Report</h1>
               <p className="text-slate-500 text-sm mt-1">{result.date}</p>
           </div>
           
           <div className="flex items-center gap-6">
                {previousResult && (
                   <div className="text-right">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">vs Last Exam</span>
                       <span className={`text-lg font-bold ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                           {diff >= 0 ? '↑' : '↓'} {Math.abs(diff).toFixed(1)}
                       </span>
                   </div>
                )}
                <div className="flex items-center gap-2">
                   <div className="text-right">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Overall Band</span>
                       <span className="text-xs text-slate-400">Target: 7.0</span>
                   </div>
                   <div className="text-5xl font-bold text-blue-600 bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
                       {result.overallScore.toFixed(1)}
                   </div>
                </div>
           </div>
       </div>

       {/* Performance Curve */}
       {result.performanceCurve && (
           <div className="mb-10 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <h3 className="font-bold text-slate-700 mb-4">Performance & Fatigue Curve</h3>
               <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={result.performanceCurve}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} />
                           <XAxis dataKey="part" tick={{fontSize: 12}} />
                           <YAxis yAxisId="left" domain={[0, 9]} label={{ value: 'Band Score', angle: -90, position: 'insideLeft' }} />
                           <YAxis yAxisId="right" orientation="right" domain={[0, 100]} label={{ value: 'Est. Fatigue %', angle: 90, position: 'insideRight' }} hide />
                           <Tooltip />
                           <Line yAxisId="left" type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} name="Score" activeDot={{ r: 8 }} />
                           <Line yAxisId="right" type="monotone" dataKey="fatigueLevel" stroke="#94a3b8" strokeDasharray="5 5" name="Fatigue" />
                       </LineChart>
                   </ResponsiveContainer>
               </div>
               <p className="text-xs text-slate-400 text-center mt-2">Dotted line indicates estimated mental fatigue levels during the exam.</p>
           </div>
       )}

       {/* 2. Summary Cards (Part 1, 2, 3, Weakest) */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
              <div className="text-xs text-slate-400 font-bold uppercase mb-1">Part 1</div>
              <div className="text-2xl font-bold text-blue-600">{result.parts.part1.score}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
              <div className="text-xs text-slate-400 font-bold uppercase mb-1">Part 2</div>
              <div className="text-2xl font-bold text-blue-600">{result.parts.part2.score}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
              <div className="text-xs text-slate-400 font-bold uppercase mb-1">Part 3</div>
              <div className="text-2xl font-bold text-blue-600">{result.parts.part3.score}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
              <div className="text-xs text-red-400 font-bold uppercase mb-1">Weakest Link</div>
              <div className="text-lg font-bold text-red-600">{result.weakestPart}</div>
          </div>
       </div>

       {/* 3. Detailed Tabs */}
       <div className="mb-8">
           <div className="flex border-b border-slate-200 mb-6">
               {(['part1', 'part2', 'part3'] as const).map(tab => (
                   <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 capitalize ${
                         activeTab === tab 
                         ? 'border-blue-600 text-blue-600' 
                         : 'border-transparent text-slate-400 hover:text-slate-600'
                     }`}
                   >
                       {tab.replace('part', 'Part ')}
                   </button>
               ))}
           </div>

           {activeTab === 'part1' && renderPartDetail(result.parts.part1, 'Part 1: Interview')}
           {activeTab === 'part2' && renderPartDetail(result.parts.part2, 'Part 2: Long Turn')}
           {activeTab === 'part3' && renderPartDetail(result.parts.part3, 'Part 3: Discussion')}
       </div>

       {/* Actions */}
       <div className="flex justify-center gap-4 border-t border-slate-100 pt-8">
           <button 
             onClick={onStartNew}
             className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-lg transition-transform hover:scale-105"
           >
               Start New Mock Exam
           </button>
       </div>
    </div>
  );
};

export default MockResultView;
