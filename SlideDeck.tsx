import React, { useRef, useState } from 'react';
import { Slide } from '../types';

declare global {
  interface Window {
    html2canvas: any;
    jspdf: any;
  }
}

interface Props {
  slides: Slide[];
  activeSlideIndex: number;
  onSlideChange: (index: number) => void;
}

// Helper to bold specific keys
const formatContent = (text: string) => {
    // Regex to match "Key: Value" or "Key words: Value" patterns to bold the key
    const parts = text.split(/(:)/);
    if (parts.length >= 2) {
        return (
            <>
                <strong className="font-bold text-main">{parts[0]}</strong>
                {parts.slice(1).join('')}
            </>
        );
    }
    return text;
};

// Sub-component for consistent rendering of slides
// Added isExport prop to massively increase font size for PDF rendering
const SlideContentRenderer: React.FC<{ slide: Slide, id?: string, style?: React.CSSProperties, className?: string, isExport?: boolean }> = ({ slide, id, style, className, isExport = false }) => (
    <div id={id} className={`flex-1 flex flex-col justify-start w-full bg-primary ${isExport ? 'p-32' : 'p-16 md:p-24'} ${className}`} style={style}>
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className={`border-l-4 border-accent pl-8 ${isExport ? 'mb-16' : 'mb-12'}`}>
                <h1 className={`font-serif text-main leading-tight mb-4 ${isExport ? 'text-8xl' : 'text-4xl md:text-6xl'}`}>
                    {slide.title}
                </h1>
                <div className={`h-1 bg-line mt-6 ${isExport ? 'w-48' : 'w-24'}`}></div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 pl-8 ${isExport ? 'space-y-12' : 'space-y-6'}`}>
                {slide.content.map((point, idx) => (
                    <p key={idx} className={`text-muted leading-relaxed font-['Times_New_Roman',_serif] max-w-6xl ${isExport ? 'text-5xl' : 'text-xl md:text-3xl'}`}>
                        {formatContent(point)}
                    </p>
                ))}
            </div>

            {/* Notes Section - Included in flow */}
            {slide.notes && (
                <div className={`border-t border-line/30 pl-8 ${isExport ? 'mt-20 pt-10' : 'mt-12 pt-6'}`}>
                    <span className="font-mono text-accent uppercase tracking-widest mb-2 block" style={{ fontSize: isExport ? '20px' : '10px' }}>Speaker Notes</span>
                    <p className={`text-muted/80 italic font-serif leading-relaxed max-w-5xl ${isExport ? 'text-3xl' : 'text-base'}`}>
                        {slide.notes}
                    </p>
                </div>
            )}
        </div>
    </div>
);

const SlideDeck: React.FC<Props> = ({ 
  slides, 
  activeSlideIndex, 
  onSlideChange, 
}) => {
  const activeSlide = slides[activeSlideIndex];
  const slideRef = useRef<HTMLDivElement>(null);
  const hiddenContainerRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const generatePDF = async (target: 'current' | 'all') => {
    if (!window.html2canvas || !window.jspdf) {
        alert("Export libraries are initializing. Please try again.");
        return;
    }
    
    setIsExporting(true);
    setShowExportMenu(false);
    
    try {
        const { jsPDF } = window.jspdf;
        // 1080p dimensions for high quality landscape
        const WIDTH = 1920;
        const HEIGHT = 1080;
        
        const pdf = new jsPDF({ 
            orientation: 'landscape', 
            unit: 'px', 
            format: [WIDTH, HEIGHT]
        });

        const elementsToCapture: HTMLElement[] = [];

        if (target === 'current') {
            // For current slide, use a specifically rendered export version if available, otherwise fallback
            // To ensure consistency, we will create a temporary export-scaled render of the current slide in the hidden container
            // Actually, we can just use the hidden container's corresponding slide
            if (hiddenContainerRef.current) {
                 const children = hiddenContainerRef.current.children;
                 // Find the specific slide index
                 if (children[activeSlideIndex]) {
                     elementsToCapture.push(children[activeSlideIndex] as HTMLElement);
                 }
            }
        } else {
            // Get all hidden slide elements
            if (hiddenContainerRef.current) {
                const children = hiddenContainerRef.current.children;
                for (let i = 0; i < children.length; i++) {
                    elementsToCapture.push(children[i] as HTMLElement);
                }
            }
        }

        for (let i = 0; i < elementsToCapture.length; i++) {
            const element = elementsToCapture[i];
            
            // Using a high scale (2 is enough since the base font size is huge now)
            const canvas = await window.html2canvas(element, { 
                scale: 2, 
                backgroundColor: getComputedStyle(document.body).getPropertyValue('--bg-primary').trim() || '#ffffff',
                logging: false,
                width: WIDTH,
                height: HEIGHT,
                windowWidth: WIDTH,
                windowHeight: HEIGHT,
                useCORS: true 
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            
            if (i > 0) pdf.addPage([WIDTH, HEIGHT], 'landscape');
            pdf.addImage(imgData, 'JPEG', 0, 0, WIDTH, HEIGHT);
        }
        
        pdf.save(`Own_Research_${target === 'all' ? 'Presentation' : 'Slide'}.pdf`);
    } catch (e) {
        console.error(e);
        alert("Failed to export PDF.");
    } finally {
        setIsExporting(false);
    }
  };

  if (!activeSlide) return <div className="text-main p-10 font-mono">Waiting for data...</div>;

  return (
    <div className="flex-1 flex flex-col h-full bg-primary overflow-hidden relative transition-colors duration-300">
      
      {/* Visible Slide (Interactive Mode) */}
      <div ref={slideRef} className="w-full h-full flex flex-col animate-fade-in relative z-10">
          <SlideContentRenderer slide={activeSlide} className="h-full" isExport={false} />
      </div>

      {/* Hidden Container for Export - Always Rendered with isExport=true for high-res large-font PDF generation */}
      <div ref={hiddenContainerRef} style={{ position: 'fixed', top: 0, left: '-10000px', width: '1920px', height: '1080px', overflow: 'hidden' }}>
          {slides.map((s, i) => (
              <div key={i} className="w-[1920px] h-[1080px] bg-primary flex flex-col">
                  <SlideContentRenderer slide={s} isExport={true} />
              </div>
          ))}
      </div>

      {/* Navigation & Export Controls */}
      <div className="absolute bottom-12 right-12 flex items-center space-x-8 z-20">
        
        {/* Export Dropdown */}
        <div className="relative">
            <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className="text-muted hover:text-main text-xs font-mono uppercase tracking-widest flex items-center gap-2 transition-colors disabled:opacity-50"
            >
                {isExporting ? (
                    <span className="material-icons-outlined text-sm animate-spin">sync</span>
                ) : (
                    <span className="material-icons-outlined text-sm">download</span>
                )}
                {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
            
            {showExportMenu && (
                <div className="absolute bottom-full right-0 mb-4 bg-surface border border-line rounded-lg shadow-xl overflow-hidden min-w-[180px] flex flex-col">
                    <button 
                        onClick={() => generatePDF('current')}
                        className="px-4 py-3 text-left text-sm text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-sans border-b border-line/50"
                    >
                        Current Slide
                    </button>
                    <button 
                        onClick={() => generatePDF('all')}
                        className="px-4 py-3 text-left text-sm text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-sans"
                    >
                        Full Presentation
                    </button>
                </div>
            )}
        </div>

        {/* Pager */}
        <div className="flex items-center gap-4">
            <button
            onClick={() => onSlideChange(Math.max(0, activeSlideIndex - 1))}
            disabled={activeSlideIndex === 0}
            className="w-12 h-12 rounded-full border border-line text-muted hover:border-accent hover:text-main disabled:opacity-20 disabled:border-line transition flex items-center justify-center bg-surface shadow-sm"
            >
            <span className="material-icons-outlined">arrow_back</span>
            </button>
            <span className="font-pixel text-3xl text-main">
                {activeSlideIndex + 1}<span className="text-muted text-xl mx-2">/</span>{slides.length}
            </span>
            <button
            onClick={() => onSlideChange(Math.min(slides.length - 1, activeSlideIndex + 1))}
            disabled={activeSlideIndex === slides.length - 1}
            className="w-12 h-12 rounded-full border border-line text-muted hover:border-accent hover:text-main disabled:opacity-20 disabled:border-line transition flex items-center justify-center bg-surface shadow-sm"
            >
            <span className="material-icons-outlined">arrow_forward</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default SlideDeck;