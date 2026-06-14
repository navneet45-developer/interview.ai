/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  fullName: string;
  preferredRole?: string;
  createdAt: string;
}

export type InterviewDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: string;
  text: string;
  role: string;
  difficulty: InterviewDifficulty;
}

export interface AnswerDetail {
  questionId: string;
  questionText: string;
  transcript: string;
  score: number; // out of 10
  feedbackReview: string;
  fillerWords: {
    um: number;
    uh: number;
    like: number;
    basically: number;
    actually: number;
  };
  wpm: number;
  duration: number; // in seconds
  confidence: number; // out of 10
  eyeContact: number; // percentage (0-100)
}

export interface Report {
  id: string;
  interviewId: string;
  userId: string;
  role: string;
  difficulty: InterviewDifficulty;
  overallScore: number; // out of 10
  technicalScore: number; // out of 10
  communicationScore: number; // out of 10
  confidenceScore: number; // out of 10
  eyeContactScore: number; // percentage (0-100)
  metrics: {
    duration: number;
    wpm: number;
    fillerCount: number;
    eyeContactPercentage: number;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  answers: AnswerDetail[];
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  role: string;
  difficulty: InterviewDifficulty;
  status: 'active' | 'completed';
  questions: string[];
  answers: AnswerDetail[];
  createdAt: string;
}

export interface DashboardStats {
  totalInterviews: number;
  completedSessions: number;
  overallAverage: number;
  technicalAverage: number;
  communicationAverage: number;
  confidenceAverage: number;
  eyeContactAverage: number;
  fillerWordsTrend: { name: string; count: number }[];
  progressTrend: { date: string; score: number }[];
}
