import React, { useState, useEffect } from 'react';
import { HistoryItem } from '../types';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

interface Props {
  onAnalyze: (text: string) => void;
  isAnalyzing: boolean;
  history: HistoryItem[];
  onLoadHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;
}

type ViewState = 'HOME' | 'MANUAL' | 'UPLOAD';

const ResearchInput: React.FC<Props> = ({ onAnalyze, isAnalyzing, history, onLoadHistory, onDeleteHistory }) => {
  const [viewState, setViewState] = useState<ViewState>('HOME');
  const [text, setText] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- Time Logic ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let progressTimer: any;
    if (isAnalyzing) {
      setProgress(0);
      progressTimer = setInterval(() => {
        setProgress(prev => Math.min(prev + (Math.random() * 5), 95));
      }, 500);
    } else {
      setProgress(100);
    }
    return () => clearInterval(progressTimer);
  }, [isAnalyzing]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let extractedText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
        }
        setText(extractedText);
      } catch (error) {
        console.error("Error reading PDF", error);
        alert("Failed to read PDF file. Please ensure it is a valid text-based PDF.");
      }
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        setText(content);
      };
      reader.readAsText(file);
    }
  };

  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  const formattedDateDay = currentTime.toLocaleDateString('en-US', { day: 'numeric' });
  const formattedDateMonth = currentTime.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const dayName = currentTime.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  // --- HOME VIEW ---
  if (viewState === 'HOME') {
    return (
        <div className="flex flex-col min-h-screen bg-primary text-main items-center justify-center p-6 relative overflow-y-auto transition-colors duration-300">
             {/* Header */}
             <div className="absolute top-0 left-0 w-full p-8 flex justify-between">
                <span className="font-mono text-xs text-muted tracking-widest">OWN RESEARCH SYSTEM</span>
                <span className="font-mono text-xs text-accent tracking-widest animate-pulse">STANDBY</span>
            </div>

            <div className="text-center mb-16 space-y-4 z-10 max-w-4xl mx-auto mt-20 animate-slide-up">
                <h1 className="text-6xl md:text-8xl font-serif tracking-tighter text-main leading-tight">
                    Upload once. <br className="hidden md:block"/> 
                    <span className="italic text-accent">Present everywhere.</span>
                </h1>
                <p className="font-mono text-sm md:text-base text-muted uppercase tracking-widest pt-4">
                    Record, Transcribe, Summarize
                </p>
                <div className="h-px w-24 bg-accent mx-auto mt-8"></div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center justify-center w-full max-w-5xl z-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {/* Clock Widget (Manual Input) */}
                <button 
                    onClick={() => setViewState('MANUAL')}
                    className="group relative bg-black border border-gray-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center w-full md:w-96 h-56 hover:border-accent hover:shadow-[0_0_40px_-10px_rgba(255,51,51,0.3)] transition-all duration-300 hover:-translate-y-1 shadow-2xl overflow-hidden active:scale-95"
                >
                    <div className="font-pixel text-[6rem] text-white tracking-widest leading-none z-10">
                        {formattedTime}
                    </div>
                     <div className="flex gap-2 mt-4 z-10">
                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
                        <span className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-pulse delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-accent/20 rounded-full animate-pulse delay-150"></span>
                    </div>
                    <span className="absolute bottom-4 font-mono text-[10px] text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors">Manual Input</span>
                </button>

                {/* Date Widget (Upload Input) */}
                <button 
                    onClick={() => setViewState('UPLOAD')}
                    className="group relative bg-black border border-gray-800 rounded-[2.5rem] p-6 flex flex-col w-full md:w-96 h-56 hover:border-accent hover:shadow-[0_0_40px_-10px_rgba(255,51,51,0.3)] transition-all duration-300 hover:-translate-y-1 shadow-2xl overflow-hidden active:scale-95"
                >
                     <div className="w-full flex justify-between items-start z-10">
                        <span className="text-accent text-sm font-serif italic tracking-wider font-bold">{dayName}</span>
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                     </div>
                     <div className="flex-1 flex items-center justify-center gap-2 z-10">
                        <span className="font-pixel text-[6rem] text-white tracking-tighter leading-none">{formattedDateDay}</span>
                        <span className="font-serif italic text-2xl text-gray-400 self-end mb-6">{formattedDateMonth}</span>
                    </div>
                    <span className="absolute bottom-4 left-0 w-full text-center font-mono text-[10px] text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors">Upload Source</span>
                </button>
            </div>
            
            {/* History Section */}
            {history.length > 0 && (
                <div className="w-full max-w-4xl mt-16 mb-10 z-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-4 mb-6">
                         <div className="h-px flex-1 bg-line"></div>
                         <span className="font-mono text-xs text-muted uppercase tracking-widest">History</span>
                         <div className="h-px flex-1 bg-line"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {history.map((item) => (
                            <div key={item.id} className="relative group">
                                <button 
                                    onClick={() => onLoadHistory(item)}
                                    className="w-full text-left bg-surface border border-line p-6 rounded-3xl hover:border-accent transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-serif text-lg text-main group-hover:text-accent truncate pr-4 transition-colors">{item.title}</span>
                                        <span className="font-mono text-[10px] text-muted whitespace-nowrap">{new Date(item.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-muted line-clamp-2 font-sans">{item.summary.substring(0, 100)}...</p>
                                </button>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Delete this presentation?')) {
                                            onDeleteHistory(item.id);
                                        }
                                    }}
                                    className="absolute top-2 right-2 p-2 text-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-all duration-300 bg-surface rounded-full shadow-sm hover:scale-110"
                                    title="Delete"
                                >
                                    <span className="material-icons-outlined text-sm">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
  }

  // --- MANUAL INPUT VIEW ---
  if (viewState === 'MANUAL') {
      return (
          <div className="flex flex-col h-screen bg-primary text-main p-6 relative animate-fade-in transition-colors duration-300">
              <button onClick={() => setViewState('HOME')} className="absolute top-6 left-6 text-muted hover:text-accent flex items-center gap-2 z-20 group">
                  <span className="material-icons-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  <span className="font-mono text-xs uppercase">Back</span>
              </button>
              
              <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
                  <div className="w-full bg-surface border border-line rounded-[2rem] p-6 md:p-10 relative flex-1 max-h-[60vh] flex flex-col shadow-2xl transition-all">
                      <textarea 
                        className="w-full h-full bg-transparent border-none text-main font-mono text-sm resize-none focus:ring-0 placeholder-muted focus:outline-none"
                        placeholder="// PASTE RAW RESEARCH TEXT HERE..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        autoFocus
                      />
                  </div>
                  
                  <div className="mt-8 w-full flex flex-col items-center">
                    {isAnalyzing ? (
                        <div className="w-full max-w-md space-y-3">
                            <div className="flex justify-between font-mono text-xs text-accent">
                                <span className="animate-pulse">ANALYZING TEXT...</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-1 w-full bg-line rounded-full overflow-hidden">
                                <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => onAnalyze(text)}
                            disabled={!text.trim()}
                            className="px-10 py-4 bg-accent text-white font-mono text-sm uppercase rounded-full hover:bg-main hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-accent/40 active:scale-95 hover:-translate-y-1"
                        >
                            Generate Visuals
                        </button>
                    )}
                  </div>
              </div>
          </div>
      )
  }

  // --- UPLOAD VIEW ---
  if (viewState === 'UPLOAD') {
      return (
          <div className="flex flex-col h-screen bg-primary text-main p-6 relative animate-fade-in transition-colors duration-300">
              <button onClick={() => setViewState('HOME')} className="absolute top-6 left-6 text-muted hover:text-accent flex items-center gap-2 z-20 group">
                  <span className="material-icons-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  <span className="font-mono text-xs uppercase">Back</span>
              </button>

              <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
                  <label className="w-full aspect-square md:aspect-video bg-surface border-2 border-dashed border-line rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-surface/80 transition-all group shadow-2xl hover:-translate-y-1">
                      <input type="file" className="hidden" accept=".txt,.md,.json,.pdf" onChange={handleFileUpload} />
                      <div className="w-16 h-16 rounded-full bg-line flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-all duration-300 text-muted group-hover:scale-110">
                          <span className="material-icons-outlined text-3xl">upload_file</span>
                      </div>
                      <div className="text-xl font-serif text-main mb-2">Drop PDF or Text file</div>
                      <div className="text-xs font-mono text-muted uppercase tracking-widest">Max size 10MB</div>
                      {text && (
                          <div className="mt-6 px-4 py-2 bg-accent/10 text-accent text-xs font-mono rounded-full border border-accent/20 flex items-center gap-2 animate-fade-in">
                              <span className="material-icons-outlined text-sm">check_circle</span>
                              File Content Loaded
                          </div>
                      )}
                  </label>

                  <div className="mt-8 w-full flex flex-col items-center">
                    {isAnalyzing ? (
                         <div className="w-full max-w-md space-y-3">
                            <div className="flex justify-between font-mono text-xs text-accent">
                                <span className="animate-pulse">PROCESSING FILE...</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-1 w-full bg-line rounded-full overflow-hidden">
                                <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => onAnalyze(text)}
                            disabled={!text.trim()}
                            className="px-10 py-4 bg-accent text-white font-mono text-sm uppercase rounded-full hover:bg-main hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-accent/40 active:scale-95 hover:-translate-y-1"
                        >
                            Begin Analysis
                        </button>
                    )}
                  </div>
              </div>
          </div>
      )
  }

  return null;
};

export default ResearchInput;