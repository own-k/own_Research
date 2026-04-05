import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    mermaid: any;
  }
}

interface Props {
  mermaidCode: string;
  onToggleLayout: () => void;
  layoutType: 'mindmap' | 'graph';
}

const MindMapView: React.FC<Props> = ({ mermaidCode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const initChart = async () => {
        if (containerRef.current && window.mermaid) {
            // Insert with opacity 0 to prevent visual jumping before scaling
            containerRef.current.innerHTML = `<div class="mermaid opacity-0 transition-opacity duration-500">${mermaidCode}</div>`;
            try {
                await window.mermaid.init(undefined, containerRef.current.querySelectorAll('.mermaid'));
                
                const svg = containerRef.current.querySelector('svg');
                if (svg) {
                    // Remove fixed dimensions if mermaid adds them, to allow scaling
                    svg.removeAttribute('height');
                    svg.style.maxWidth = 'none';

                    const bBox = svg.getBoundingClientRect();
                    const containerRect = containerRef.current.getBoundingClientRect();
                    
                    if (bBox.width > 0 && bBox.height > 0) {
                        const padding = 60; // Comfortable padding around the diagram
                        const availW = containerRect.width - padding;
                        const availH = containerRect.height - padding;
                        
                        const scaleX = availW / bBox.width;
                        const scaleY = availH / bBox.height;
                        
                        // Fit to screen: use the smaller ratio to ensure full visibility
                        let optimalScale = Math.min(scaleX, scaleY);
                        
                        // Constraint the zoom:
                        // - Min 0.1: Allow zooming out for huge graphs
                        // - Max 1.5: Don't zoom in too aggressively for tiny graphs
                        optimalScale = Math.min(Math.max(optimalScale, 0.1), 1.5);
                        
                        setScale(optimalScale);
                        // Center is handled by flex container, reset position to 0
                        setPosition({ x: 0, y: 0 });
                    }
                    
                    // Reveal the chart
                    const div = containerRef.current.querySelector('.mermaid');
                    if (div) div.classList.remove('opacity-0');
                }
            } catch (e) {
                console.error("Mermaid render error", e);
                containerRef.current.innerHTML = '<div class="text-accent font-mono p-4 text-center">Failed to render structure.<br/><span class="text-xs text-gray-600">Complex syntax error</span></div>';
            }
        }
    };
    initChart();
  }, [mermaidCode]);

  const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault(); // Stop page scroll
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      // Allow a wider range of manual zoom
      setScale(s => Math.min(Math.max(0.1, s * delta), 5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (isDragging) {
          setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      }
  };

  const handleMouseUp = () => {
      setIsDragging(false);
  };

  return (
    <div className="flex-1 h-full bg-primary overflow-hidden relative flex flex-col">
        {/* Header/Controls */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-4 bg-surface/80 backdrop-blur border border-line px-4 py-2 rounded-full shadow-lg">
             <span className="text-xs font-mono uppercase text-muted flex items-center gap-2">
                 <span className="material-icons-outlined text-sm">account_tree</span>
                 Structure View
             </span>
             <div className="w-[1px] h-4 bg-line"></div>
             <button onClick={() => setScale(s => s * 1.2)} className="text-muted hover:text-main"><span className="material-icons-outlined text-sm">add</span></button>
             <button onClick={() => { setScale(1); setPosition({x:0, y:0}); }} className="text-muted hover:text-main text-xs font-mono">RESET</button>
             <button onClick={() => setScale(s => s * 0.8)} className="text-muted hover:text-main"><span className="material-icons-outlined text-sm">remove</span></button>
        </div>

        {/* Viewport */}
        <div 
            className="flex-1 overflow-hidden cursor-move relative bg-primary"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
             <div 
                ref={containerRef}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    transformOrigin: 'center center',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
             >
                 {/* Mermaid renders here */}
             </div>
             
             {/* Background Grid Pattern for style */}
             <div className="absolute inset-0 pointer-events-none opacity-5" style={{ 
                 backgroundImage: 'radial-gradient(var(--text-muted) 1px, transparent 1px)', 
                 backgroundSize: '20px 20px' 
             }}></div>
        </div>
    </div>
  );
};

export default MindMapView;