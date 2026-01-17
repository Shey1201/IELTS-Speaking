
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

const parseImportedDoc = (text: string): Topic[] => {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const topics: Topic[] = [];
  
  let mode: 'part1' | 'part2' | 'part3' = 'part1';
  let currentCategory = 'General';
  let currentPart2Id: string | null = null;

  const part1Regex = /^Part\s*1[:：]?/i;
  const part2Regex = /^Part\s*2/i;
  const p3Regex = /^(P|p)3/;
  const categoryRegex = /^(\d+\.|√)/;
  const describeRegex = /^Describe\s+a/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (part1Regex.test(line)) {
      mode = 'part1';
      continue;
    }
    if (part2Regex.test(line)) {
      mode = 'part2';
      continue;
    }

    if (mode === 'part1') {
      if (categoryRegex.test(line)) {
        currentCategory = line.replace(/^(\d+\.|√)\s*/, '').split(/[(（]/)[0].trim();
      } else {
        topics.push({
          id: `imp-p1-${Date.now()}-${topics.length}`,
          part: IeLtsPart.Part1,
          category: currentCategory,
          title: line
        });
      }
    } else {
      if (p3Regex.test(line)) {
        mode = 'part3';
        continue;
      }
      if (categoryRegex.test(line)) {
        mode = 'part2';
        continue;
      }

      if (describeRegex.test(line)) {
        mode = 'part2';
        const newP2: Topic = {
          id: `imp-p2-${Date.now()}-${topics.length}`,
          part: IeLtsPart.Part2,
          title: line,
          description: ''
        };
        
        const descLines = [];
        let j = i + 1;
        while (j < lines.length) {
          const next = lines[j];
          if (categoryRegex.test(next) || p3Regex.test(next) || describeRegex.test(next)) break;
          descLines.push(next);
          j++;
        }
        newP2.description = descLines.join('\n');
        topics.push(newP2);
        currentPart2Id = newP2.id;
        
        i = j - 1;
        continue;
      }

      if (mode === 'part3' && currentPart2Id) {
        topics.push({
          id: `imp-p3-${Date.now()}-${topics.length}`,
          part: IeLtsPart.Part3,
          title: line,
          relatedTopicId: currentPart2Id
        });
      }
    }
  }
  return topics;
};

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
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'import'>('add');
  const [isImporting, setIsImporting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    id: '',
    part: IeLtsPart.Part1 as IeLtsPart,
    category: '',
    title: '',
    description: '',
    relatedTopicId: '',
    isStarred: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Expanded states
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Derived Data
  const sortTopics = (a: Topic, b: Topic) => (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0);
  const part1Topics = topics.filter(t => t.part === IeLtsPart.Part1);
  const part2Topics = topics.filter(t => t.part === IeLtsPart.Part2).sort(sortTopics);
  const part3Topics = topics.filter(t => t.part === IeLtsPart.Part3);

  const part1CategoriesRaw = Array.from(new Set(part1Topics.map(t => t.category || 'General'))) as string[];
  const part1Categories = part1CategoriesRaw.map(cat => {
      const catTopics = part1Topics.filter(t => (t.category || 'General') === cat);
      const isStarred = catTopics.length > 0 && catTopics.every(t => t.isStarred);
      return { name: cat, isStarred };
  }).sort((a, b) => (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0));

  const orphanPart3Topics = part3Topics.filter(p3 => !p3.relatedTopicId);

  // Actions
  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTopicId(expandedTopicId === id ? null : id);
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategory(expandedCategory === cat ? null : cat);
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      id: Date.now().toString(),
      part: IeLtsPart.Part1,
      category: '',
      title: '',
      description: '',
      relatedTopicId: '',
      isStarred: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (e: React.MouseEvent, topic: Topic) => {
    e.stopPropagation();
    setModalMode('edit');
    setFormData({
      id: topic.id,
      part: topic.part,
      category: topic.category || '',
      title: topic.title,
      description: topic.description || '',
      relatedTopicId: topic.relatedTopicId || '',
      isStarred: topic.isStarred || false
    });
    setIsModalOpen(true);
  };

  const openImportModal = () => {
    setModalMode('import');
    setIsModalOpen(true);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const topicData: Topic = {
      id: formData.id,
      part: formData.part,
      title: formData.title,
      description: formData.description,
      category: formData.part === IeLtsPart.Part1 ? (formData.category || 'General') : undefined,
      relatedTopicId: formData.part === IeLtsPart.Part3 ? formData.relatedTopicId : undefined,
      isStarred: formData.isStarred
    };

    if (modalMode === 'edit') {
        onUpdateTopic(topicData);
    } else {
        onAddTopic(topicData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    onDeleteTopic(id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.name.toLowerCase().endsWith('.docx') && 
          file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          alert("Please upload a .docx file");
          return;
      }

      setIsImporting(true);
      // Close modal if open to show loading overlay
      setIsModalOpen(false); 

      const reader = new FileReader();
      reader.onload = async (event) => {
          try {
              const arrayBuffer = event.target?.result as ArrayBuffer;
              if (!arrayBuffer) throw new Error("File read error");

              const result = await extractRawText({ arrayBuffer });
              const text = result.value.trim();
              
              if (!text) throw new Error("Document is empty");

              const topicsToImport = parseImportedDoc(text);

              if (topicsToImport.length === 0) {
                   throw new Error("No valid topics found. Ensure document has 'Part 1' or 'Part 2' headers.");
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
      
      reader.readAsArrayBuffer(file);
      // Reset input
      e.target.value = '';
  };

  // Render Helpers
  const renderActions = (topic: Topic) => (
      <div className="flex items-center gap-1 ml-2 relative z-20 shrink-0">
          <button 
             type="button"
             onClick={(e) => openEditModal(e, topic)}
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
      
      {/* Importing Overlay */}
      {isImporting && (
          <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
              <svg className="animate-spin h-8 w-8 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-bold text-slate-600">Importing document...</span>
          </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                 {/* Modal Header */}
                 <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                     <div>
                        <h3 className="font-bold text-xl text-slate-800">
                            {modalMode === 'add' ? 'Add New Question' : modalMode === 'edit' ? 'Edit Question' : 'Import Questions'}
                        </h3>
                        <p className="text-sm text-slate-400 mt-0.5">
                            {modalMode === 'add' ? 'Add a new question to the question bank' : modalMode === 'edit' ? 'Update question details' : 'Import from Word document'}
                        </p>
                     </div>
                     <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-2 rounded-full transition-all">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                     </button>
                 </div>
                 
                 {/* Modal Body */}
                 <div className="p-6 bg-white">
                     {modalMode === 'import' ? (
                         <div 
                           className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer group" 
                           onClick={() => fileInputRef.current?.click()}
                         >
                             <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                             </div>
                             <p className="text-slate-700 font-bold mb-1">Click to upload Word file</p>
                             <p className="text-xs text-slate-400">Supports .docx files with Part 1/2/3 headers</p>
                             <input 
                                ref={fileInputRef} 
                                type="file" 
                                className="hidden" 
                                accept=".docx" 
                                onChange={handleFileChange}
                             />
                         </div>
                     ) : (
                         <form id="topicForm" onSubmit={handleModalSubmit} className="space-y-5">
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Part</label>
                                     <div className="relative">
                                        <select 
                                            value={formData.part}
                                            onChange={(e) => setFormData({...formData, part: e.target.value as IeLtsPart})}
                                            className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        >
                                            <option value={IeLtsPart.Part1}>Part 1</option>
                                            <option value={IeLtsPart.Part2}>Part 2</option>
                                            <option value={IeLtsPart.Part3}>Part 3</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                     </div>
                                 </div>
                                 
                                 {formData.part === IeLtsPart.Part1 && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Topic Category</label>
                                        <input 
                                            type="text"
                                            value={formData.category}
                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="e.g. Hometown, Work"
                                        />
                                    </div>
                                 )}
                                 
                                 {formData.part === IeLtsPart.Part3 && (
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Parent Topic</label>
                                         <div className="relative">
                                            <select 
                                                value={formData.relatedTopicId}
                                                onChange={(e) => setFormData({...formData, relatedTopicId: e.target.value})}
                                                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            >
                                                <option value="">-- Select --</option>
                                                {part2Topics.map(p2 => (
                                                    <option key={p2.id} value={p2.id}>{p2.title}</option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                         </div>
                                     </div>
                                 )}
                             </div>

                             <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                                    {formData.part === IeLtsPart.Part2 ? "Topic Title" : "Question"}
                                 </label>
                                 <input 
                                    type="text" 
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                    placeholder={formData.part === IeLtsPart.Part2 ? "e.g. Describe a traditional festival" : "Enter the question..."}
                                    required
                                 />
                             </div>
                             
                             {formData.part === IeLtsPart.Part2 && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Cue Card Points</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[120px] resize-none"
                                        placeholder="You should say:&#10;- What it is&#10;- When it is..."
                                    />
                                </div>
                             )}
                         </form>
                     )}
                 </div>

                 {/* Modal Footer */}
                 {modalMode !== 'import' && (
                     <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                         <button 
                             onClick={() => setIsModalOpen(false)} 
                             className="px-5 py-2.5 text-slate-600 font-bold bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg text-sm transition-all"
                         >
                             Cancel
                         </button>
                         <button 
                             form="topicForm" 
                             type="submit" 
                             className="px-5 py-2.5 bg-slate-900 text-white font-bold hover:bg-black rounded-lg text-sm shadow-md shadow-slate-200 transition-all transform active:scale-95"
                         >
                             {modalMode === 'add' ? 'Add Question' : 'Save Changes'}
                         </button>
                     </div>
                 )}
             </div>
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
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-50 bg-white">
             <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                 Question Bank
                 <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full text-[10px]">{topics.length}</span>
             </h2>
             <div className="flex items-center gap-1">
                 <button 
                    onClick={openImportModal}
                    className="text-slate-400 hover:bg-slate-100 hover:text-blue-600 p-1.5 rounded transition-all"
                    title="Import Questions"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                 </button>
                 <button 
                    onClick={openAddModal}
                    className="text-slate-400 hover:bg-slate-100 hover:text-blue-600 p-1.5 rounded transition-all"
                    title="Add Question"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                 </button>
             </div>
          </div>

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
