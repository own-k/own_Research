export enum AppView {
  INPUT = 'INPUT',
  PRESENTATION = 'PRESENTATION',
  MINDMAP = 'MINDMAP',
  SUMMARY = 'SUMMARY',
}

export interface Slide {
  id: string;
  title: string;
  content: string[]; // Bullet points
  notes?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  title: string;
  slides: Slide[];
  summary: string;
  mindMapCode: string;
  fullText: string;
}