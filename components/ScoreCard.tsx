
import React, { useState, useMemo } from 'react';
import { EvaluationResult, IeLtsPart, TranscriptToken } from '../types';

interface ScoreCardProps {
  result: EvaluationResult;
  onPart3Click?: (question: string) => void;
  currentPart?: IeLtsPart;
  previousScore?: number;
  onRetry: () => void;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ result, onPart3Click, currentPart, previousScore, onRetry }) => {
  const { score, transcript, improvedVersions, part3Suggestions, feedbackDetail } = result;
  const [activeTab, setActiveTab] = useState<'fc' | 'lr' | 'gra' | 'pr'>('gra');

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name.includes('Google') && v.lang.includes('en-US')) || voices.find(v => v.lang.includes('en'));
      if (preferred) utterance.voice = preferred;
      window.speechSynthesis.speak(utterance);
    }
  };

  const analysis = useMemo(() => {
     const fillers = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'actually', 'mean', 'sort of'];
     const fillerCounts: Record<string, number> = {};
     let totalFillers = 0;

     const graErrors = transcript.filter(t => t.gra);
     const lrImprovements = transcript.filter(t => t.lr);
     const prErrors = transcript.filter(t => t.pr?.error);

     transcript.forEach(t => {
         const clean = t.text.toLowerCase().replace(/[^a-z\s]/g, '');
         if (fillers.includes(clean)) {
             fillerCounts[clean] = (fillerCounts[clean] || 0) + 1;
             totalFillers++;
         }
     });

     return { graErrors, lrImprovements, prErrors, fillerCounts, totalFillers };
  }, [transcript]);

  // Use the first available version. The service is optimized to return just one "Band 6.5" version now.
  const modelAnswer = improvedVersions[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in pb-12">
        {/* 1. Score Header */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             <div className="col-span-2 md:col-span-1 bg-blue-600 text-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg shadow-blue-200">
                 <div className="text-5xl font-bold mb-1">{score.overall.toFixed(1)}</div>
                 <div className="text-xs font-bold uppercase opacity-80">Overall Score</div>
                 {previousScore !== undefined && (
                    <div className={`mt-2 text-xs font-bold px-2 py-0.5 rounded bg-black/20 ${score.overall >= previousScore ? 'text-green-300' : 'text-red-300'}`}>
                         {score.overall >= previousScore ? '↑' : '↓'} {Math.abs(score.overall - previousScore).toFixed(1)}
                    </div>
                 )}
             </div>
             
             {[
                 { id: 'fc', label: 'Fluency', score: score.fluencyCoherence, color: 'blue' },
                 { id: 'lr', label: 'Lexical', score: score.lexicalResource, color: 'indigo' },
                 { id: 'gra', label: 'Grammar', score: score.grammaticalRange, color: 'amber' },
                 { id: 'pr', label: 'Pronunciation', score: score.pronunciation, color: 'rose' },
             ].map(item => (
                 <div key={item.id} className={`bg-white rounded-2xl p-4 border border-${item.color}-100 flex flex-col items-center justify-center shadow-sm`}>
                     <div className={`text-3xl font-bold text-${item.color}-600 mb-1`}>{item.score.toFixed(1)}</div>
                     <div className="text-xs font-bold text-slate-400 uppercase">{item.label}</div>
                 </div>
             ))}
        </div>

        {/* 2. Transcript Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a1 1 0 01-3 3z" /></svg>
                    Spoken Transcript
                </h3>
                <div className="flex gap-2 text-[10px] font-bold uppercase">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> Grammar</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400"></span> Vocabulary</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Pronunciation</span>
                </div>
            </div>
            <div className="p-6 text-lg leading-loose text-slate-700">
                {transcript.map((t, i) => {
                    const hasGra = !!t.gra;
                    const hasLr = !!t.lr;
                    const hasPr = !!t.pr?.error;
                    
                    let classes = "";
                    if (hasGra) classes = "decoration-red-400 decoration-2 underline underline-offset-4 text-red-900 bg-red-50";
                    else if (hasPr) classes = "decoration-yellow-400 decoration-2 underline underline-offset-4 text-yellow-900 bg-yellow-50";
                    else if (hasLr) classes = "decoration-indigo-400 decoration-wavy underline underline-offset-4 text-indigo-900 bg-indigo-50";
                    
                    return (
                        <span key={i} className={`rounded px-0.5 mx-0.5 transition-colors cursor-default ${classes}`} title={hasGra ? t.gra?.error : hasPr ? `IPA: ${t.pr?.ipa}` : ''}>
                            {t.text}
                        </span>
                    );
                })}
            </div>
        </div>

        {/* 3. Detailed Analysis Tabs */}
        <div>
            {/* Tabs Header */}
            <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-xl px-4 shadow-sm overflow-x-auto no-scrollbar">
                {[
                    { id: 'fc', label: 'Fluency & Coherence', count: analysis.totalFillers },
                    { id: 'lr', label: 'Lexical Resource', count: analysis.lrImprovements.length },
                    { id: 'gra', label: 'Grammar Accuracy', count: analysis.graErrors.length },
                    { id: 'pr', label: 'Pronunciation', count: analysis.prErrors.length },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 whitespace-nowrap px-4 ${
                            activeTab === tab.id 
                            ? 'border-blue-600 text-blue-600' 
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>
            
            {/* Tabs Content */}
            <div className="bg-white rounded-b-xl rounded-t-xl min-h-[300px] border border-slate-200 shadow-sm p-6">
                
                {/* GRA Content */}
                {activeTab === 'gra' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        {analysis.graErrors.length === 0 ? (
                             <EmptyState title="Perfect Grammar!" desc="No grammatical errors were detected in your speech." />
                        ) : (
                            <div className="grid gap-4">
                                {analysis.graErrors.map((t, i) => (
                                    <div key={i} className="bg-red-50/50 border border-red-100 rounded-xl p-5 hover:border-red-200 transition-colors">
                                        <h4 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs">!</span>
                                            Grammar Issue
                                        </h4>
                                        <div className="space-y-3 pl-0 md:pl-8">
                                            <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-baseline">
                                                <span className="w-24 text-xs font-bold uppercase text-red-400 md:text-right shrink-0">Error</span>
                                                <div className="bg-white px-3 py-2 rounded-lg border border-red-100 text-red-700 line-through decoration-red-300 w-full">
                                                    {t.text}
                                                </div>
                                            </div>
                                            <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-baseline">
                                                <span className="w-24 text-xs font-bold uppercase text-green-500 md:text-right shrink-0">Correction</span>
                                                <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-100 text-green-800 font-bold w-full">
                                                    {t.gra?.correction}
                                                </div>
                                            </div>
                                            <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-baseline">
                                                <span className="w-24 text-xs font-bold uppercase text-slate-400 md:text-right shrink-0">Why?</span>
                                                <p className="text-sm text-slate-600 leading-relaxed">
                                                    {t.gra?.explanation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <TipsList tips={feedbackDetail.grammar.tips} color="amber" />
                    </div>
                )}

                {/* FC Content */}
                {activeTab === 'fc' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                         <div className="grid md:grid-cols-2 gap-6">
                             {/* Filler Words Stats */}
                             <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50">
                                 <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                     <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a1 1 0 01-3 3z" /></svg>
                                     Filler Words
                                 </h4>
                                 {analysis.totalFillers === 0 ? (
                                     <p className="text-sm text-slate-500 italic">Excellent! Very few filler words detected.</p>
                                 ) : (
                                     <div className="flex flex-wrap gap-2">
                                         {Object.entries(analysis.fillerCounts).map(([word, count]) => (
                                             <div key={word} className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
                                                 <span className="text-slate-600 font-medium mr-2">{word}</span>
                                                 <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 rounded-full">{count}</span>
                                             </div>
                                         ))}
                                     </div>
                                 )}
                                 <p className="text-xs text-slate-400 mt-3">Using too many fillers like "um", "uh", "like" can lower your Fluency score.</p>
                             </div>

                             {/* Issues List */}
                             <div className="border border-slate-100 rounded-xl p-5 bg-white">
                                 <h4 className="font-bold text-slate-700 mb-4">Detected Issues</h4>
                                 {feedbackDetail.fluency.issues.length === 0 ? (
                                      <p className="text-sm text-slate-500">No major fluency issues detected.</p>
                                 ) : (
                                     <ul className="space-y-2">
                                         {feedbackDetail.fluency.issues.map((issue, i) => (
                                             <li key={i} className="text-sm text-red-600 flex gap-2 items-start">
                                                 <span className="mt-1">•</span>
                                                 {issue}
                                             </li>
                                         ))}
                                     </ul>
                                 )}
                             </div>
                         </div>
                         <TipsList tips={feedbackDetail.fluency.tips} color="blue" />
                    </div>
                )}
                
                {/* LR Content */}
                {activeTab === 'lr' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        {analysis.lrImprovements.length === 0 ? (
                            <EmptyState title="Good Vocabulary" desc="Your vocabulary choice was appropriate." />
                        ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                                {analysis.lrImprovements.map((t, i) => (
                                    <div key={i} className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-4">
                                         <div className="text-xs font-bold text-slate-400 uppercase mb-2">Better Choice</div>
                                         <div className="flex items-center gap-3 mb-3">
                                             <span className="text-slate-500 line-through decoration-slate-300">{t.text}</span>
                                             <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                             <div className="flex flex-wrap gap-1">
                                                {t.lr?.better.slice(0, 2).map(w => (
                                                    <span key={w} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold text-sm">{w}</span>
                                                ))}
                                             </div>
                                         </div>
                                         <p className="text-xs text-indigo-900/60">Using more precise or idiomatic vocabulary improves your score.</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <TipsList tips={feedbackDetail.lexical.tips} color="indigo" />
                    </div>
                )}

                {/* PR Content */}
                {activeTab === 'pr' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                         {analysis.prErrors.length === 0 ? (
                             <EmptyState title="Clear Pronunciation" desc="Your pronunciation was clear and easy to understand." />
                         ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {analysis.prErrors.map((t, i) => (
                                    <div key={i} className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-4 flex items-center justify-between">
                                        <div>
                                            <div className="text-lg font-bold text-slate-800">{t.text}</div>
                                            <div className="text-sm font-mono text-slate-500">/{t.pr?.ipa}/</div>
                                        </div>
                                        <button 
                                            onClick={() => speakText(t.text)}
                                            className="p-2 bg-white rounded-full shadow-sm text-blue-500 hover:scale-110 transition-transform"
                                        >
                                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                         )}
                         <TipsList tips={feedbackDetail.pronunciation.tips} color="yellow" />
                    </div>
                )}

            </div>
        </div>

        {/* 4. Model Answer (Band 6.5) */}
        {modelAnswer && (
            <div className="bg-blue-50/80 rounded-2xl p-6 border border-blue-100">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                         {/* Play Button */}
                         <button 
                            onClick={() => speakText(modelAnswer.text)}
                            className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-110 transition-all"
                            title="Shadowing Play"
                        >
                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                        </button>

                        <div>
                            <div className="flex items-center gap-2">
                                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">PRO</span>
                                <h3 className="font-bold text-slate-800 text-lg">
                                    Model Answer
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Band Indicator */}
                    <div className="flex bg-white rounded-lg p-1 border border-blue-100 shadow-sm">
                        <div className="px-3 py-1.5 text-xs font-bold rounded-md bg-blue-100 text-blue-700">
                            Band 6.5 (Achievable Goal)
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-blue-100/50 shadow-sm relative">
                    <p className="text-slate-700 leading-relaxed text-lg">
                        "{modelAnswer.text}"
                    </p>
                </div>
                
                <div className="mt-3 text-right">
                    <p className="text-xs text-slate-400 font-medium">Tip: Listen and repeat. This answer is simple, clear, and correct.</p>
                </div>
            </div>
        )}

        {/* 5. Actions */}
        <div className="flex justify-center gap-4 pt-4">
            <button onClick={onRetry} className="px-6 py-2 rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200">Retry</button>
            {currentPart === IeLtsPart.Part2 && part3Suggestions?.[0] && (
                 <button onClick={() => onPart3Click && onPart3Click(part3Suggestions[0])} className="px-6 py-2 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">
                     Next: Part 3
                 </button>
            )}
        </div>
    </div>
  );
};

const EmptyState = ({ title, desc }: { title: string, desc: string }) => (
    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <div className="text-4xl mb-2 opacity-20">✨</div>
        <h4 className="font-bold text-slate-600">{title}</h4>
        <p className="text-sm text-slate-400">{desc}</p>
    </div>
);

const TipsList = ({ tips, color }: { tips: string[], color: string }) => (
    <div className={`bg-${color}-50 p-5 rounded-xl border border-${color}-100`}>
        <h4 className={`font-bold text-${color}-800 mb-3 text-sm uppercase tracking-wide`}>Improvement Tips</h4>
        <ul className="space-y-2">
            {tips.map((tip, i) => (
                <li key={i} className={`text-sm text-${color}-900 flex gap-2`}>
                    <span className="opacity-50">•</span>
                    {tip}
                </li>
            ))}
        </ul>
    </div>
);

export default ScoreCard;
