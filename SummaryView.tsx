import React from 'react';

interface Props {
  summary: string;
}

const SummaryView: React.FC<Props> = ({ summary }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-primary overflow-y-auto animate-fade-in transition-colors duration-300">
      <div className="max-w-4xl mx-auto w-full p-8 md:p-24">
        <div className="mb-12 border-l-4 border-accent pl-8">
            <h1 className="text-4xl md:text-6xl font-serif text-main leading-tight mb-4">
              Executive Summary
            </h1>
            <div className="h-1 w-24 bg-line mt-6"></div>
        </div>
        
        <div className="prose prose-lg md:prose-xl prose-invert max-w-none">
            <p className="text-muted font-serif text-xl md:text-2xl leading-relaxed whitespace-pre-wrap">
                {summary || "No summary available. Please analyze a paper first."}
            </p>
        </div>
      </div>
    </div>
  );
};

export default SummaryView;