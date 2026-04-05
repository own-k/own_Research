import React, { useState, useEffect } from 'react';
import ResearchInput from './components/ResearchInput';
import SlideDeck from './components/SlideDeck';
import MindMapView from './components/MindMapView';
import SummaryView from './components/SummaryView';
import ChatInterface from './components/ChatInterface';
import { AppView, Slide, HistoryItem } from './types';
import * as geminiService from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.INPUT);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [summary, setSummary] = useState('');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [fullText, setFullText] = useState('');
  
  // Default light mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Loading States
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mind Map State
  const [mindMapCode, setMindMapCode] = useState<string>('');
  
  // Load History on Mount
  useEffect(() => {
      const savedHistory = localStorage.getItem('own_research_history');
      if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
      }
  }, []);

  // Apply Theme
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true);
    setFullText(text);
    try {
      // 1. Generate Slides & Summary
      const data = await geminiService.analyzeResearchPaper(text);
      
      const newSlides = data.slides.map((s: any, i: number) => ({
        ...s,
        id: `slide-${i}`,
      }));
      setSlides(newSlides);
      const newSummary = data.summary || "Summary generation pending...";
      setSummary(newSummary);

      // 2. Generate Mind Map (Background)
      const code = await geminiService.generateMindMapCode(text);
      setMindMapCode(code);

      // 3. Save to History
      const newItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          title: newSlides[0]?.title || "Research Session",
          slides: newSlides,
          summary: newSummary,
          mindMapCode: code,
          fullText: text
      };
      
      const updatedHistory = [newItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('own_research_history', JSON.stringify(updatedHistory));

      setView(AppView.PRESENTATION);
    } catch (e) {
      console.error("Analysis failed", e);
      alert("Failed to analyze text. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadHistory = (item: HistoryItem) => {
      setSlides(item.slides);
      setSummary(item.summary);
      setMindMapCode(item.mindMapCode);
      setFullText(item.fullText);
      setActiveSlideIndex(0);
      setView(AppView.PRESENTATION);
  };

  const handleDeleteHistory = (id: string) => {
      const updatedHistory = history.filter(item => item.id !== id);
      setHistory(updatedHistory);
      localStorage.setItem('own_research_history', JSON.stringify(updatedHistory));
  };

  return (
    <div className="h-full font-sans text-main bg-primary transition-colors duration-300 overflow-hidden">
      {view === AppView.INPUT ? (
        <ResearchInput 
            onAnalyze={handleAnalyze} 
            isAnalyzing={isAnalyzing} 
            history={history}
            onLoadHistory={handleLoadHistory}
            onDeleteHistory={handleDeleteHistory}
        />
      ) : (
        <div className="flex h-full flex-col">
          {/* Header */}
          <header className="h-16 bg-primary border-b border-line flex items-center justify-between px-6 md:px-8 z-30 transition-colors duration-300 relative">
            <div className="font-serif font-bold text-xl tracking-tighter text-main cursor-pointer" onClick={() => setView(AppView.INPUT)}>
                OWN <span className="text-accent italic">Research</span>
            </div>
            
            <div className="flex bg-surface rounded-full p-1 border border-line gap-1">
                <button 
                    onClick={() => setView(AppView.SUMMARY)}
                    className={`px-4 md:px-6 py-2 text-xs font-mono uppercase rounded-full transition-all duration-300 ${view === AppView.SUMMARY ? 'bg-main text-primary font-bold shadow-md' : 'text-muted hover:text-main hover:bg-black/5'}`}
                >
                    Summary
                </button>
                <button 
                    onClick={() => setView(AppView.PRESENTATION)}
                    className={`px-4 md:px-6 py-2 text-xs font-mono uppercase rounded-full transition-all duration-300 ${view === AppView.PRESENTATION ? 'bg-main text-primary font-bold shadow-md' : 'text-muted hover:text-main hover:bg-black/5'}`}
                >
                    Deck
                </button>
                <button 
                    onClick={() => setView(AppView.MINDMAP)}
                    className={`px-4 md:px-6 py-2 text-xs font-mono uppercase rounded-full transition-all duration-300 ${view === AppView.MINDMAP ? 'bg-main text-primary font-bold shadow-md' : 'text-muted hover:text-main hover:bg-black/5'}`}
                >
                    Structure
                </button>
            </div>

            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={`p-2 rounded-full transition-all duration-300 ${isChatOpen ? 'text-accent bg-accent/10' : 'text-muted hover:text-main hover:bg-black/5'}`}
                    title="Toggle AI Chat"
                >
                    <span className="material-icons-outlined text-lg">chat_bubble_outline</span>
                </button>
                <div className="h-4 w-px bg-line"></div>
                <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="text-muted hover:text-main p-2 rounded-full hover:bg-black/5 transition-all"
                >
                    <span className="material-icons-outlined text-lg">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
                </button>
                <button 
                    onClick={() => setView(AppView.INPUT)} 
                    className="hidden md:block text-xs font-mono text-muted hover:text-accent uppercase tracking-widest border border-line px-4 py-2 rounded-full hover:border-accent hover:bg-accent/5 transition-all active:scale-95"
                >
                    New Session
                </button>
            </div>
          </header>

          {/* Animated Main Content Wrapper */}
          <div className="flex-1 flex min-h-0 relative">
             <div key={view} className="animate-fade-in flex-1 h-full flex flex-col relative w-full">
                 {view === AppView.SUMMARY && (
                     <SummaryView summary={summary} />
                 )}
                 {view === AppView.PRESENTATION && (
                      <SlideDeck 
                        slides={slides}
                        activeSlideIndex={activeSlideIndex}
                        onSlideChange={setActiveSlideIndex}
                    />
                 )}
                 {view === AppView.MINDMAP && (
                     <MindMapView 
                        mermaidCode={mindMapCode || "graph TD; A[Loading Structure...] --> B[Analyzing Relationships...];"} 
                        onToggleLayout={() => {}} 
                        layoutType={'graph'}
                     />
                 )}
             </div>
          </div>
          
          <ChatInterface 
            contextText={fullText} 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default App;