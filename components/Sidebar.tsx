
import React, { useState, useRef } from 'react';
import { IeLtsPart, Topic, MockExamResult } from '../types';
// @ts-ignore
import { extractRawText } from 'mammoth';

interface SidebarProps {
  topics: Topic[];
  activeTopicId: string | null;
  onSelectTopic: (topic: Topic) => void;
  onAddTopic: (topic: Topic) => void;
  onUpdateTopic: (topic: Topic) => void;
  onImportTopics: (topics: Topic[]) => void;
  onDeleteTopic: (id: string) => void;
  onToggleStar: (id: string) => void;
  onToggleCategoryStar: (category: string) => void;
  activeMode: 'practice' | 'mock';
  onSwitchMode: (mode: 'practice' | 'mock') => void;
  mockHistory: MockExamResult[];
  onSelectMockResult: (result: MockExamResult) => void;
  onStartNewMock: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  topics, 
  activeTopicId, 
  onSelectTopic, 
  onAddTopic,
  onUpdateTopic,
  onImportTopics,
  onDeleteTopic,
  onToggleStar,
  onToggleCategoryStar,
  activeMode,
  onSwitchMode,
  mockHistory,
  onSelectMockResult,
  onStartNewMock
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState('');
  const [newTopicPart, setNewTopicPart] = useState<IeLtsPart>(IeLtsPart.Part1);
  const [selectedPart2Parent, setSelectedPart2Parent] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Expanded states
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Grouping & Sorting Logic
  const sortTopics = (a: Topic, b: Topic) => (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0);

  const part1Topics = topics.filter(t => t.part === IeLtsPart.Part1);
  const part2Topics = topics.filter(t => t.part === IeLtsPart.Part2).sort(sortTopics);
  const part3Topics = topics.filter(t => t.part === IeLtsPart.Part3);

  // Extract Part 1 Categories and determine if they are starred
  const part1CategoriesRaw = Array.from(new Set(part1Topics.map(t => t.category || 'General')));
  
  const part1Categories = part1CategoriesRaw.map(cat => {
      const catTopics = part1Topics.filter(t => (t.category || 'General') === cat);
      const isStarred = catTopics.length > 0 && catTopics.every(t => t.isStarred);
      return { name: cat, isStarred };
  }).sort((a, b) => (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0));

  const orphanPart3Topics = part3Topics.filter(p3 => !p3.relatedTopicId);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTopicId(expandedTopicId === id ? null : id);
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategory(expandedCategory === cat ? null : cat);
  };

  const resetForm = () => {
    setNewTopicTitle('');
    setNewTopicDesc('');
    setNewTopicCategory('');
    setSelectedPart2Parent('');
    setNewTopicPart(IeLtsPart.Part1);
    setEditingTopic(null);
  };

  const handleEditClick = (e: React.MouseEvent, topic: Topic) => {
    e.stopPropagation();
    e.preventDefault();
    setIsAdding(true);
    setEditingTopic(topic);
    setNewTopicPart(topic.part);
    setNewTopicTitle(topic.title);
    setNewTopicDesc(topic.description || '');
    setNewTopicCategory(topic.category || '');
    setSelectedPart2Parent(topic.relatedTopicId || '');
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    onDeleteTopic(id);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    const topicData: Topic = {
      id: editingTopic ? editingTopic.id : Date.now().toString(),
      part: newTopicPart,
      title: newTopicTitle,
      description: newTopicDesc,
      category: newTopicPart === IeLtsPart.Part1 ? (newTopicCategory || 'General') : undefined,
      relatedTopicId: newTopicPart === IeLtsPart.Part3 ? selectedPart2Parent : undefined,
      isStarred: editingTopic ? editingTopic.isStarred : false
    };

    if (editingTopic) {
        onUpdateTopic(topicData);
    } else {
        onAddTopic(topicData);
    }
    
    setIsAdding(false);
    resetForm();
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Ensure clean slate
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      e.target.value = '';

      if (!file.name.toLowerCase().endsWith('.docx') && 
          file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          alert("文件格式错误，请上传word文档");
          return;
      }

      setIsImporting(true);

      const reader = new FileReader();
      reader.onload = async (event) => {
          try {
              const arrayBuffer = event.target?.result as ArrayBuffer;
              if (!arrayBuffer) throw new Error("File read error");

              const result = await extractRawText({ arrayBuffer });
              const text = result.value.trim();
              
              if (!text) throw new Error("Document is empty");

              let topicsToImport: Topic[] = [];

              try {
                  const json = JSON.parse(text);
                  if (Array.isArray(json)) {
                      topicsToImport = json;
                  }
              } catch (e) {
                  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                  topicsToImport = lines.map((line, index) => {
                      return {
                          id: `doc-imported-${Date.now()}-${index}`,
                          part: IeLtsPart.Part1,
                          title: line,
                          category: 'Imported Word Doc'
                      };
                  });
              }

              if (topicsToImport.length === 0) {
                   throw new Error("No valid topics found in document.");
              }

              setTimeout(() => {
                  onImportTopics(topicsToImport);
                  setIsImporting(false);
              }, 600);

          } catch (err: any) {
              console.error(err);
              alert(`Import Failed: ${err.message}`);
              setIsImporting(false);
          }
      };
      
      reader.onerror = () => {
          alert("Error reading file.");
          setIsImporting(false);
      };
      
      reader.readAsArrayBuffer(file);
  };

  // Render Action Buttons
  const renderActions = (topic: Topic) => (
      <div className="flex items-center gap-1 ml-2 relative z-20 shrink-0">
          <button 
             type="button"
             onClick={(e) => handleEditClick(e, topic)}
             className="p-1.5 hover:bg-slate-200 rounded text-slate-300 hover:text-blue-500 transition-colors"
             title="Edit"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
          </button>
          <button 
             type="button"
             onClick={(e) => handleDeleteClick(e, topic.id)}
             className="p-1.5 hover:bg-red-100 rounded text-slate-300 hover:text-red-500 transition-colors"
             title="Delete"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
      </div>
  );

  const StarIcon = ({ isStarred, onClick }: { isStarred: boolean, onClick: (e: React.MouseEvent) => void }) => (
      <button 
         type="button"
         onClick={onClick}
         className={`p-1 mr-1 rounded hover:bg-slate-200 transition-colors flex-shrink-0 relative z-20 ${isStarred ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-400'}`}
      >
          {isStarred ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-yellow-400 pointer-events-none" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
          )}
      </button>
  );

  return (
    <div className="w-80 bg-white border-r border-slate-200 h-full flex flex-col flex-shrink-0 z-10 shadow-sm relative">
      {isImporting && (
          <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
              <svg className="animate-spin h-8 w-8 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-bold text-slate-600">Importing document...</span>
          </div>
      )}

      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
          <span className="bg-blue-600 text-white p-1 rounded-md text-sm">PRO</span>
          IELTS Speaking
        </h1>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
           <button 
             onClick={() => onSwitchMode('practice')}
             className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
               activeMode === 'practice' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
             }`}
           >
             Practice
           </button>
           <button 
             onClick={() => onSwitchMode('mock')}
             className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
               activeMode === 'mock' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
             }`}
           >
             Mock Exams
           </button>
        </div>
      </div>

      {activeMode === 'practice' ? (
        <>
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-50">
             <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Topic Library</h2>
             <div className="flex items-center gap-1">
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".docx" 
                    onChange={handleFileChange}
                 />
                 <button 
                    onClick={handleImportClick}
                    className="text-slate-500 hover:bg-slate-100 p-1.5 rounded transition-colors"
                    title="Import Word Doc"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                 </button>
                 <button 
                    onClick={() => { setIsAdding(!isAdding); resetForm(); }}
                    className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors"
                    title="Add Custom Topic"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                 </button>
             </div>
          </div>

          {isAdding && (
            <div className="p-4 bg-slate-50 border-b border-slate-200 animate-in slide-in-from-top-2">
              <form onSubmit={handleAddSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Select Part</label>
                  <select 
                    value={newTopicPart}
                    onChange={(e) => setNewTopicPart(e.target.value as IeLtsPart)}
                    className="w-full text-sm border-slate-300 rounded-md p-2"
                  >
                    <option value={IeLtsPart.Part1}>Part 1</option>
                    <option value={IeLtsPart.Part2}>Part 2</option>
                    <option value={IeLtsPart.Part3}>Part 3</option>
                  </select>
                </div>

                {newTopicPart === IeLtsPart.Part1 && (
                    <input 
                      type="text" 
                      value={newTopicCategory}
                      onChange={(e) => setNewTopicCategory(e.target.value)}
                      className="w-full text-sm border-slate-300 rounded-md p-2"
                      placeholder="Category (e.g. Work, Home)"
                    />
                )}

                {newTopicPart === IeLtsPart.Part3 && (
                    <div>
                       <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Link to Part 2 Topic</label>
                       <select 
                          value={selectedPart2Parent}
                          onChange={(e) => setSelectedPart2Parent(e.target.value)}
                          className="w-full text-sm border-slate-300 rounded-md p-2"
                          required
                       >
                          <option value="">-- Select Part 2 Parent --</option>
                          {part2Topics.map(p2 => (
                              <option key={p2.id} value={p2.id}>{p2.title}</option>
                          ))}
                       </select>
                    </div>
                )}

                <div>
                   <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      {newTopicPart === IeLtsPart.Part2 ? "Topic Theme" : "Question"}
                   </label>
                   <input 
                    type="text" 
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    className="w-full text-sm border-slate-300 rounded-md p-2"
                    placeholder={newTopicPart === IeLtsPart.Part2 ? "e.g., A Traditional Festival" : "Question text..."}
                    required
                  />
                </div>
                
                {newTopicPart === IeLtsPart.Part2 && (
                   <div>
                       <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Cue Card Description</label>
                       <textarea
                          value={newTopicDesc}
                          onChange={(e) => setNewTopicDesc(e.target.value)}
                          className="w-full text-sm border-slate-300 rounded-md p-2 h-20"
                          placeholder="You should say:&#10;- What it is&#10;- When it is..."
                          required
                       />
                   </div>
                )}

                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-blue-600 text-white text-xs py-2 rounded">
                      {editingTopic ? 'Update' : 'Add'}
                  </button>
                  <button type="button" onClick={() => { setIsAdding(false); resetForm(); }} className="flex-1 bg-white border border-slate-300 text-xs py-2 rounded">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Part 1 Categories */}
            <div>
               <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Part 1</h2>
               <div className="space-y-1">
                 {part1Categories.map(({ name: cat, isStarred }) => {
                    const catTopics = part1Topics.filter(t => (t.category || 'General') === cat);
                    const isExpanded = expandedCategory === cat;

                    return (
                        <div key={cat} className="space-y-1">
                             <div className={`w-full flex items-center justify-between px-2 py-2 rounded-lg text-sm transition-all duration-200 font-medium ${
                                    isExpanded ? 'bg-slate-100 text-slate-800' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                             >
                                <div className="flex items-center flex-1" onClick={() => toggleCategory(cat)}>
                                    <StarIcon 
                                        isStarred={isStarred || false} 
                                        onClick={(e) => { e.stopPropagation(); onToggleCategoryStar(cat); }} 
                                    />
                                    <button className="flex items-center gap-2 flex-1 text-left">
                                        {cat}
                                    </button>
                                </div>
                                <button onClick={() => toggleCategory(cat)} className="p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform text-slate-400 ${isExpanded ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </button>
                             </div>

                             {isExpanded && (
                                 <div className="ml-7 pl-3 border-l-2 border-slate-100 space-y-1 py-1">
                                     {catTopics.map(topic => (
                                         <div 
                                           key={topic.id}
                                           className={`group flex items-center justify-between w-full px-3 py-2 rounded text-sm transition-all cursor-pointer relative ${
                                                activeTopicId === topic.id 
                                                ? 'bg-blue-50 text-blue-700 font-medium' 
                                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                            }`}
                                           onClick={() => onSelectTopic(topic)}
                                         >
                                            <span className="truncate flex-1 text-left">{topic.title}</span>
                                            {renderActions(topic)}
                                         </div>
                                     ))}
                                 </div>
                             )}
                        </div>
                    );
                 })}
               </div>
            </div>

            {/* Part 2 & Part 3 Nested */}
            <div>
               <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Part 2 & 3</h2>
               <div className="space-y-1">
                 {part2Topics.map(p2 => {
                   const relatedPart3s = part3Topics.filter(p3 => p3.relatedTopicId === p2.id);
                   const isExpanded = expandedTopicId === p2.id || activeTopicId === p2.id || relatedPart3s.some(p3 => p3.id === activeTopicId);
                   
                   return (
                     <div key={p2.id} className="space-y-1">
                       <div 
                          className={`group w-full flex items-center justify-between px-2 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer relative ${
                            activeTopicId === p2.id 
                            ? 'bg-blue-50 text-blue-700 font-medium shadow-sm border border-blue-100' 
                            : 'text-slate-600 hover:bg-slate-100'
                          }`}
                          onClick={() => onSelectTopic(p2)}
                       >
                         <div className="flex items-center gap-2 flex-1 min-w-0">
                            {/* Star on Left */}
                            <StarIcon 
                                isStarred={p2.isStarred || false} 
                                onClick={(e) => { e.stopPropagation(); onToggleStar(p2.id); }} 
                            />

                            <span className="truncate flex-1 text-left">{p2.title}</span>
                            {relatedPart3s.length > 0 && (
                                <button 
                                    onClick={(e) => toggleExpand(p2.id, e)}
                                    className="p-1 rounded hover:bg-slate-200 text-slate-400"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                            )}
                         </div>
                         {renderActions(p2)}
                       </div>
                       
                       {/* Nested Part 3s */}
                       {isExpanded && relatedPart3s.length > 0 && (
                         <div className="pl-6 space-y-1 border-l-2 border-slate-100 ml-3">
                           {relatedPart3s.map(p3 => (
                             <div
                               key={p3.id}
                               onClick={() => onSelectTopic(p3)}
                               className={`group flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs transition-all duration-200 cursor-pointer relative ${
                                 activeTopicId === p3.id 
                                   ? 'bg-indigo-50 text-indigo-700 font-medium' 
                                   : 'text-slate-500 hover:bg-slate-50'
                               }`}
                             >
                               <div className="flex items-center flex-1 min-w-0">
                                   <span className="text-[10px] uppercase font-bold text-slate-300 mr-1 flex-shrink-0">P3</span>
                                   <span className="truncate">{p3.title}</span>
                               </div>
                               {renderActions(p3)}
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                   );
                 })}
                 
                 {orphanPart3Topics.length > 0 && (
                   <div className="pt-2 border-t border-slate-100 mt-2">
                      <p className="text-[10px] font-bold text-slate-300 uppercase px-2 mb-1">Misc Part 3</p>
                      {orphanPart3Topics.map(p3 => (
                        <div
                          key={p3.id}
                          onClick={() => onSelectTopic(p3)}
                          className={`group flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer relative ${
                            activeTopicId === p3.id 
                              ? 'bg-blue-50 text-blue-700 font-medium' 
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate flex-1">{p3.title}</span>
                          {renderActions(p3)}
                        </div>
                      ))}
                   </div>
                 )}
               </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col h-full">
           <div className="p-4 border-b border-slate-100 bg-slate-50">
             <button 
               onClick={onStartNewMock}
               className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 font-bold shadow-md transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
             >
                <span className="text-xl leading-none">+</span> New Mock Exam
             </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-3">
               <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Exam History</h2>
               {mockHistory.length === 0 ? (
                 <p className="text-xs text-slate-400 text-center py-8">No exams yet.</p>
               ) : (
                 mockHistory.map(exam => (
                   <div 
                     key={exam.id}
                     onClick={() => onSelectMockResult(exam)}
                     className="bg-white border border-slate-200 rounded-xl p-3 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer group"
                   >
                     <div className="flex justify-between items-start mb-2">
                       <div>
                         <h3 className="font-bold text-slate-800 text-sm">Mock Exam #{mockHistory.indexOf(exam) + 1}</h3>
                         <span className="text-[10px] text-slate-400">{exam.date}</span>
                       </div>
                       <div className="text-lg font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                         {exam.overallScore.toFixed(1)}
                       </div>
                     </div>
                     <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-purple-500 h-full w-full"></div>
                     </div>
                     <p className="text-[10px] text-slate-400 mt-1 text-right">Completed</p>
                   </div>
                 ))
               )}
           </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
