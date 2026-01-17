
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Recorder from './components/Recorder';
import ScoreCard from './components/ScoreCard';
import MockExam from './components/MockExam';
import MockResultView from './components/MockResultView';
import { Topic, EvaluationResult, MockQuestion, IeLtsPart, MockExamResult } from './types';
import { evaluateAudio, generateMockTest, evaluateMockTest, convertTextToSpeech } from './services/geminiService';
import { loadTopics, saveTopics, loadMockHistory, saveMockHistory } from './services/storageService';

const App: React.FC = () => {
  // Navigation State
  const [activeMode, setActiveMode] = useState<'practice' | 'mock'>('practice');

  // Practice Mode State
  // Initialize from storage or fall back to constants inside loadTopics()
  const [topics, setTopics] = useState<Topic[]>(() => loadTopics());
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previousScore, setPreviousScore] = useState<number | undefined>(undefined);
  
  // Practice Mode UI State
  const [isTextVisible, setIsTextVisible] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Mock Exam State
  const [isMockRunning, setIsMockRunning] = useState(false);
  const [mockQuestions, setMockQuestions] = useState<MockQuestion[]>([]);
  const [mockHistory, setMockHistory] = useState<MockExamResult[]>(() => loadMockHistory());
  const [selectedMockResult, setSelectedMockResult] = useState<MockExamResult | null>(null);
  const [isLoadingMock, setIsLoadingMock] = useState(false);
  const [isGradingMock, setIsGradingMock] = useState(false);

  // --- Persistence Effects ---
  useEffect(() => {
    saveTopics(topics);
  }, [topics]);

  useEffect(() => {
    saveMockHistory(mockHistory);
  }, [mockHistory]);

  // Set initial active topic if none selected and topics exist
  useEffect(() => {
    if (!activeTopic && topics.length > 0) {
      setActiveTopic(topics[0]);
    }
  }, []); // Run once on mount

  // --- Effects ---
  useEffect(() => {
    setIsTextVisible(false);
    setIsPlayingAudio(false);
  }, [activeTopic]);

  // --- Practice Handlers ---

  const handleTopicSelect = (topic: Topic) => {
    setActiveTopic(topic);
    setPreviousScore(result?.score.overall); // Store previous score locally for instant comparison if switching topics
    setResult(null);
    setError(null);
  };

  const handleRetry = () => {
    setResult(null);
    setError(null);
  };

  const handleAddTopic = (newTopic: Topic) => {
    setTopics(prev => [...prev, newTopic]);
  };

  const handleUpdateTopic = (updatedTopic: Topic) => {
    setTopics(prev => prev.map(t => t.id === updatedTopic.id ? updatedTopic : t));
    if (activeTopic?.id === updatedTopic.id) {
        setActiveTopic(updatedTopic);
    }
  };

  const normalizePart = (p: string | number): IeLtsPart => {
      const lower = String(p).toLowerCase().replace(/\s/g, '');
      if (lower.includes('part1') || lower === '1') return IeLtsPart.Part1;
      if (lower.includes('part2') || lower === '2') return IeLtsPart.Part2;
      if (lower.includes('part3') || lower === '3') return IeLtsPart.Part3;
      return IeLtsPart.Part1;
  };

  const handleImportTopics = (newTopics: Topic[]) => {
      // 1. Normalize Imported Data
      const imported = newTopics.map(t => ({
          ...t,
          id: t.id || `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          part: normalizePart(t.part || 'Part 1'),
          title: t.title ? t.title.trim() : 'Untitled Topic',
          category: t.category ? t.category.trim() : (t.part === IeLtsPart.Part1 ? 'General' : undefined),
          description: t.description ? t.description.trim() : undefined
      }));
      
      setTopics(prev => {
          const nextTopics = [...prev];
          let added = 0;
          let updated = 0;
          
          // Map to track ID resolution for relationships (Part 3 -> Part 2)
          // Key: ID from the import file/parser
          // Value: ID in the final state (either existing ID from prev or new ID)
          const idMap = new Map<string, string>();

          imported.forEach(importTopic => {
              // Resolve relatedTopicId if it exists (for Part 3)
              let resolvedRelatedId = importTopic.relatedTopicId;
              if (resolvedRelatedId && idMap.has(resolvedRelatedId)) {
                  resolvedRelatedId = idMap.get(resolvedRelatedId);
              }

              // Check for duplicates (Same Part + Same Title case-insensitive)
              const matchIndex = nextTopics.findIndex(t => 
                  t.part === importTopic.part && 
                  t.title.toLowerCase() === importTopic.title.toLowerCase()
              );

              if (matchIndex >= 0) {
                  // Match found: Update existing
                  const existingId = nextTopics[matchIndex].id;
                  
                  // Map the import ID to the existing ID so subsequent Part 3s point to this existing Part 2
                  idMap.set(importTopic.id, existingId);

                  nextTopics[matchIndex] = {
                      ...nextTopics[matchIndex],
                      // Overwrite fields if present in import
                      description: importTopic.description || nextTopics[matchIndex].description,
                      category: importTopic.category || nextTopics[matchIndex].category,
                      relatedTopicId: resolvedRelatedId || nextTopics[matchIndex].relatedTopicId
                      // Preserve existing ID and isStarred status
                  };
                  updated++;
              } else {
                  // No match: Add new
                  const topicToAdd = {
                      ...importTopic,
                      relatedTopicId: resolvedRelatedId
                  };
                  
                  // Map import ID to itself (it's being added as is)
                  idMap.set(importTopic.id, topicToAdd.id);
                  
                  nextTopics.push(topicToAdd);
                  added++;
              }
          });

          setTimeout(() => alert(`Import Complete:\n• Added: ${added} new topics\n• Updated: ${updated} existing topics`), 100);
          return nextTopics;
      });
  };

  const handleDeleteTopic = (id: string) => {
    if (window.confirm("Are you sure you want to delete this topic?")) {
        setTopics(prev => {
            const updated = prev.filter(t => t.id !== id);
            return updated;
        });
        if (activeTopic?.id === id) {
            setActiveTopic(null);
        }
    }
  };

  const handleToggleStar = (id: string) => {
    setTopics(prev => prev.map(t => 
        t.id === id ? { ...t, isStarred: !t.isStarred } : t
    ));
  };

  const handleToggleCategoryStar = (category: string) => {
    setTopics(prev => {
        const categoryTopics = prev.filter(t => (t.category || 'General') === category);
        const allStarred = categoryTopics.length > 0 && categoryTopics.every(t => t.isStarred);
        const newStatus = !allStarred;

        return prev.map(t => 
           (t.category || 'General') === category ? { ...t, isStarred: newStatus } : t
        );
    });
  };

  const playQuestionAudio = async () => {
    if (!activeTopic) return;
    setIsPlayingAudio(true);
    let textToRead = activeTopic.title;
    if (activeTopic.part === IeLtsPart.Part2) {
       textToRead = `Here is your topic. ${activeTopic.title}. ${activeTopic.description || ''}. You have one minute to prepare.`;
    } else if (activeTopic.description) {
       textToRead = `${activeTopic.title}. ${activeTopic.description}`;
    }

    try {
        await convertTextToSpeech(textToRead);
    } catch (e) {
        console.error(e);
    } finally {
        setIsPlayingAudio(false);
    }
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    if (!activeTopic) return;
    
    // Store current result as previous if re-recording same topic
    if (result) setPreviousScore(result.score.overall);

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const evaluation = await evaluateAudio(audioBlob, activeTopic);
      setResult(evaluation);
    } catch (err: any) {
      console.error(err);
      // Capture detailed error if possible
      const msg = err.message || "Failed to analyze audio. Please check your API Key and internet connection.";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePart3Extension = (questionText: string) => {
    const newTopic: Topic = {
        id: `p3-ext-${Date.now()}`,
        part: IeLtsPart.Part3,
        title: questionText,
        description: `Follow-up question based on your previous Part 2 answer.\nTopic: ${activeTopic?.title}`
    };
    setActiveTopic(newTopic);
    setResult(null);
    window.scrollTo(0, 0);
  };

  // --- Mock Exam Handlers ---

  const handleStartMock = async () => {
      setSelectedMockResult(null);
      setIsLoadingMock(true);
      try {
          const questions = await generateMockTest();
          setMockQuestions(questions);
          setIsMockRunning(true);
      } catch (e) {
          console.error(e);
          alert("Failed to generate mock test. Please check API key.");
      } finally {
          setIsLoadingMock(false);
      }
  };

  const handleMockFinish = async (blobs: Blob[]) => {
      setIsGradingMock(true);
      try {
          const examResult = await evaluateMockTest(blobs, mockQuestions);
          setMockHistory(prev => [examResult, ...prev]);
          setSelectedMockResult(examResult);
          setIsMockRunning(false);
      } catch (e) {
          console.error(e);
          alert("Failed to grade mock exam.");
          setIsMockRunning(false); 
      } finally {
          setIsGradingMock(false);
      }
  };

  const getLatestMockResult = () => {
    return mockHistory.length > 0 ? mockHistory[0] : null;
  };
  
  // Find previous result for comparison in Mock View
  const getPreviousMockResult = (currentId: string) => {
      const idx = mockHistory.findIndex(h => h.id === currentId);
      if (idx !== -1 && idx < mockHistory.length - 1) {
          return mockHistory[idx + 1];
      }
      return undefined;
  };

  const showTextControls = activeTopic?.part !== IeLtsPart.Part2;
  const isPart2 = activeTopic?.part === IeLtsPart.Part2;

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar 
        topics={topics} 
        activeTopicId={activeMode === 'practice' ? activeTopic?.id || null : null} 
        onSelectTopic={handleTopicSelect}
        onAddTopic={handleAddTopic}
        onUpdateTopic={handleUpdateTopic}
        onImportTopics={handleImportTopics}
        onDeleteTopic={handleDeleteTopic}
        onToggleStar={handleToggleStar}
        onToggleCategoryStar={handleToggleCategoryStar}
        activeMode={activeMode}
        onSwitchMode={(mode) => {
            setActiveMode(mode);
            if (mode === 'practice') {
                setIsMockRunning(false);
                setSelectedMockResult(null);
            }
        }}
        mockHistory={mockHistory}
        onSelectMockResult={(res) => {
            setSelectedMockResult(res);
            setIsMockRunning(false);
        }}
        onStartNewMock={handleStartMock}
      />
      
      <main className="flex-1 overflow-y-auto h-full relative">
        {(isLoadingMock || isGradingMock) && (
             <div className="absolute inset-0 bg-white/90 z-50 flex items-center justify-center flex-col gap-4 backdrop-blur-sm">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                 <p className="text-slate-600 font-medium animate-pulse">
                     {isLoadingMock ? "Generating unique exam questions..." : "Analyzing exam performance (this may take a minute)..."}
                 </p>
             </div>
        )}

        {activeMode === 'mock' ? (
            isMockRunning ? (
                <MockExam 
                    questions={mockQuestions} 
                    onFinish={handleMockFinish}
                    onExit={() => setIsMockRunning(false)}
                />
            ) : selectedMockResult ? (
                <MockResultView 
                    result={selectedMockResult}
                    onStartNew={handleStartMock}
                    previousResult={getPreviousMockResult(selectedMockResult.id)}
                />
            ) : (
                <div className="max-w-4xl mx-auto p-8">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">IELTS Full Mock Exam</h2>
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">PRO SIMULATION</span>
                        </div>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Strict adherence to IELTS flow: Part 1 (Interview) → Part 2 (Cue Card) → Part 3 (Discussion). 
                            Includes strict timing and AI-examiner audio prompts.
                        </p>
                        <button 
                           onClick={handleStartMock}
                           className="w-full sm:w-auto bg-purple-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                            Start Full Mock Test
                        </button>
                    </div>

                    {mockHistory.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
                            <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
                                <h3 className="font-bold text-slate-700">Latest Result</h3>
                                <span className="text-xs text-slate-400">{getLatestMockResult()?.date}</span>
                            </div>
                            <div className="p-8 flex flex-col items-center justify-center text-center">
                                <div className="text-6xl font-bold text-blue-600 mb-2">
                                    {getLatestMockResult()?.overallScore.toFixed(1)}
                                </div>
                                <p className="text-slate-400 text-xs uppercase tracking-wide font-bold mb-8">Overall Band Score</p>
                                
                                <div className="grid grid-cols-3 gap-4 w-full max-w-lg mb-8">
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <div className="text-xs text-blue-400 font-bold uppercase mb-1">Part 1</div>
                                        <div className="text-xl font-bold text-blue-700">{getLatestMockResult()?.parts.part1.score}</div>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <div className="text-xs text-blue-400 font-bold uppercase mb-1">Part 2</div>
                                        <div className="text-xl font-bold text-blue-700">{getLatestMockResult()?.parts.part2.score}</div>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                        <div className="text-xs text-red-400 font-bold uppercase mb-1">Weakest</div>
                                        <div className="text-sm font-bold text-red-700">{getLatestMockResult()?.weakestPart}</div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setSelectedMockResult(getLatestMockResult())}
                                        className="bg-slate-800 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-700"
                                    >
                                        View Full Report
                                    </button>
                                    <button 
                                        onClick={handleStartMock}
                                        className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-green-700"
                                    >
                                        Retake Test
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )
        ) : (
            <div className="max-w-6xl mx-auto p-6 md:p-12">
            
            {activeTopic ? (
                <div className="animate-in fade-in duration-500">
                <header className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                activeTopic.part === IeLtsPart.Part1 ? 'bg-green-100 text-green-700' :
                                activeTopic.part === IeLtsPart.Part2 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-purple-100 text-purple-700'
                            }`}>
                            {activeTopic.part}
                            </span>
                            {activeTopic.id.startsWith('p3-ext') && (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded border border-slate-200">
                                    Extension Topic
                                </span>
                            )}
                            {activeTopic.isStarred && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            )}
                        </div>

                        {showTextControls && (
                            <div className="flex items-center gap-2">
                               <button 
                                 onClick={playQuestionAudio}
                                 disabled={isPlayingAudio}
                                 className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-bold shadow-sm ${
                                    isPlayingAudio 
                                    ? 'bg-slate-100 text-slate-400 cursor-wait' 
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                 }`}
                                 title="Play Question (AI Voice)"
                               >
                                 {isPlayingAudio ? (
                                    <>
                                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                      Loading...
                                    </>
                                 ) : (
                                    <>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                      Listen (AI)
                                    </>
                                 )}
                               </button>
                               <button 
                                 onClick={() => setIsTextVisible(!isTextVisible)}
                                 className={`p-2 rounded-full transition-colors ${isTextVisible ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-white'}`}
                                 title={isTextVisible ? "Hide Text" : "Show Text"}
                               >
                                 {isTextVisible ? (
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                 ) : (
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.742L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>
                                 )}
                               </button>
                            </div>
                        )}
                    </div>
                    
                    <h1 className={`text-4xl font-bold text-slate-900 mb-6 leading-tight transition-all duration-300 ${!isPart2 && !isTextVisible ? 'blur-md select-none opacity-50' : ''}`}>
                        {activeTopic.title}
                    </h1>
                    
                    {activeTopic.description && (
                    <div className={`bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-slate-700 whitespace-pre-line leading-relaxed text-lg transition-all duration-300 ${!isPart2 && !isTextVisible ? 'blur-md select-none opacity-50' : ''}`}>
                        {activeTopic.description}
                    </div>
                    )}
                </header>

                <section className="mb-16">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1">
                        <Recorder 
                            onRecordingComplete={handleRecordingComplete} 
                            isProcessing={isProcessing}
                        />
                    </div>
                    {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        <span className="font-medium">Error:</span> {error}
                    </div>
                    )}
                </section>

                {result && (
                    <section className="mb-12">
                    <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
                        <h2 className="text-2xl font-bold text-slate-900">AI Assessment</h2>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">GENERATED</span>
                    </div>
                    <ScoreCard 
                        result={result} 
                        onPart3Click={handlePart3Extension}
                        currentPart={activeTopic.part}
                        previousScore={previousScore}
                        onRetry={handleRetry}
                    />
                    </section>
                )}
                </div>
            ) : (
                <div className="h-96 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-lg font-medium">Select a topic from the sidebar to start practicing</p>
                </div>
            )}
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
