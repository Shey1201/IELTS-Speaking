
export enum IeLtsPart {
  Part1 = 'Part 1',
  Part2 = 'Part 2',
  Part3 = 'Part 3'
}

export interface Topic {
  id: string;
  part: IeLtsPart;
  title: string;
  description?: string; // Specifically for Part 2 cue card details
  relatedTopicId?: string; // ID of the Part 2 topic this Part 3 belongs to
  category?: string; // Grouping for Part 1 (e.g., "Hometown", "Work")
  isStarred?: boolean; // For favorites/pinning
}

export interface IeLtsScore {
  fluencyCoherence: number;
  lexicalResource: number;
  grammaticalRange: number;
  pronunciation: number;
  overall: number;
}

// New: Word-level analysis for interactive highlights
export interface TranscriptToken {
  text: string;
  types: ('gra' | 'lr' | 'pr')[]; // Can have multiple issues
  gra?: { error: string; correction: string; explanation: string };
  lr?: { simple: string; better: string[] };
  pr?: { ipa: string; error: boolean }; 
}

// New: Multi-band improved versions
export interface ImprovedResponse {
  band: number; // 6.0, 7.0
  text: string;
  analysis: {
    fillers: string[]; // words to bold (markers)
    vocabulary: string[]; // words to bold (idioms/phrasal verbs)
    reasoning: string; // "Why this is Band X"
  };
  audioText: string; // Text optimized for TTS (with pauses)
}

export interface FeedbackDetail {
  fluency: {
    issues: string[];
    tips: string[];
  };
  lexical: {
    betterWords: { original: string; better: string; reason: string }[];
    tips: string[];
  };
  grammar: {
    errors: { error: string; correction: string; explanation: string }[];
    tips: string[];
  };
  pronunciation: {
    mispronounced: string[];
    tips: string[];
  };
}

export interface EvaluationResult {
  score: IeLtsScore;
  feedbackDetail: FeedbackDetail; // Keeping for legacy/summary view
  transcript: TranscriptToken[]; // New: Rich text
  improvedVersions: ImprovedResponse[]; // New: Multiple bands
  part3Suggestions: string[]; // Only populated if input was Part 2
  timestamp: number; // For history comparison
}

export interface AudioState {
  isRecording: boolean;
  audioUrl: string | null;
  audioBlob: Blob | null;
}

// Mock Exam Types
export interface MockQuestion extends Topic {
  durationLimit?: number; // seconds
  prepTime?: number; // seconds (for Part 2)
}

export interface PartResult {
  score: number; // The overall score for this specific part
  dimensions: IeLtsScore; // The 4 dimensions for this specific part
  analysis: string; // Detailed analysis in English
  improvements: string[];
}

export interface MockExamResult {
  id: string;
  date: string;
  overallScore: number;
  weakestPart: string;
  parts: {
    part1: PartResult;
    part2: PartResult;
    part3: PartResult;
  };
  questions: MockQuestion[];
  performanceCurve: { part: string; fatigueLevel: number; score: number }[]; // New: Fatigue analysis
}
