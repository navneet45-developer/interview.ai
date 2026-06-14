import mongoose, { Schema, Document, Model } from "mongoose";

// 1. Users Schema
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  preferredRole: string;
  role: "user" | "admin";
  isBlocked: boolean;
  lastLogin: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true },
  preferredRole: { type: String, default: "MERN Developer" },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isBlocked: { type: Boolean, default: false },
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// 2. Resumes Schema
export interface IResume extends Document {
  userId: string;
  fileName: string;
  parsedSkills: string[];
  parsedProjects: string[];
  parsedTechnologies: string[];
  atsScore: number;
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  rawText?: string;
  createdAt: Date;
}

const ResumeSchema = new Schema<IResume>({
  userId: { type: String, required: true, index: true },
  fileName: { type: String, required: true },
  parsedSkills: [{ type: String }],
  parsedProjects: [{ type: String }],
  parsedTechnologies: [{ type: String }],
  atsScore: { type: Number, required: true },
  missingSkills: [{ type: String }],
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  suggestions: [{ type: String }],
  rawText: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// 3. Interviews Schema (Includes Recruiter Simulation Mode Role)
export interface IInterview extends Document {
  userId: string;
  role: string; // e.g. MERN Interviewer, Python Interviewer, HR Recruiter, etc
  difficulty: "Easy" | "Medium" | "Hard";
  status: "active" | "completed";
  questions: string[];
  answers: any[];
  resumeId?: string; // Optional reference if generated from resume
  recruiterRole?: string; // Recruiter Simulation Mode: 'HR Recruiter' | 'MERN Interviewer' | 'Java Interviewer' | 'Python Interviewer' | 'Engineering Manager' | 'System Design Interviewer'
  videoUrl?: string; // If general mock interview video upload
  createdAt: Date;
}

const InterviewSchema = new Schema<IInterview>({
  userId: { type: String, required: true, index: true },
  role: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
  status: { type: String, enum: ["active", "completed"], default: "active" },
  questions: [{ type: String }],
  answers: [{ type: Schema.Types.Mixed }],
  resumeId: { type: String, index: true },
  recruiterRole: { type: String },
  videoUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// 4. Questions Schema
export interface IQuestion extends Document {
  text: string;
  role: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category?: string;
  sampleAnswer?: string;
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  role: { type: String, required: true, index: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  category: { type: String },
  sampleAnswer: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// 5. Answers Schema (Individual Question-Answer video analyzer results)
export interface IAnswer extends Document {
  interviewId?: string;
  userId: string;
  questionText: string;
  videoUrl?: string;
  audioUrl?: string;
  transcript: string;
  score: number; // 1-10
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
  confidence: number; // 1-10
  eyeContact: number; // percentage (0-100)
  improvedSampleAnswer?: string; // Improved Sample Answer proposed by AI
  createdAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  interviewId: { type: String, index: true },
  userId: { type: String, required: true, index: true },
  questionText: { type: String, required: true },
  videoUrl: { type: String },
  audioUrl: { type: String },
  transcript: { type: String, required: true },
  score: { type: Number, required: true },
  feedbackReview: { type: String, required: true },
  fillerWords: {
    um: { type: Number, default: 0 },
    uh: { type: Number, default: 0 },
    like: { type: Number, default: 0 },
    basically: { type: Number, default: 0 },
    actually: { type: Number, default: 0 },
  },
  wpm: { type: Number, required: true },
  duration: { type: Number, required: true },
  confidence: { type: Number, required: true },
  eyeContact: { type: Number, required: true },
  improvedSampleAnswer: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// 6. Reports Schema
export interface IReport extends Document {
  interviewId: string;
  userId: string;
  role: string;
  difficulty: "Easy" | "Medium" | "Hard";
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  eyeContactScore: number;
  metrics: {
    duration: number;
    wpm: number;
    fillerCount: number;
    eyeContactPercentage: number;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  answers: any[];
  videoUrl?: string; // For mock interview video analyzer upload
  transcript?: string; // Aggregated text
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>({
  interviewId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  role: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  overallScore: { type: Number, required: true },
  technicalScore: { type: Number, required: true },
  communicationScore: { type: Number, required: true },
  confidenceScore: { type: Number, required: true },
  eyeContactScore: { type: Number, required: true },
  metrics: {
    duration: { type: Number, required: true },
    wpm: { type: Number, required: true },
    fillerCount: { type: Number, required: true },
    eyeContactPercentage: { type: Number, required: true },
  },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  suggestions: [{ type: String }],
  answers: [{ type: Schema.Types.Mixed }],
  videoUrl: { type: String },
  transcript: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// 7. Analytics Schema
export interface IAnalytics extends Document {
  userId: string;
  atsHistory: Array<{
    resumeId: string;
    fileName: string;
    score: number;
    date: Date;
  }>;
  scoreHistory: Array<{
    interviewId: string;
    role: string;
    overallScore: number;
    technicalScore: number;
    communicationScore: number;
    confidenceScore: number;
    eyeContactScore: number;
    date: Date;
  }>;
  createdAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  userId: { type: String, required: true, unique: true, index: true },
  atsHistory: [
    {
      resumeId: { type: String, required: true },
      fileName: { type: String, required: true },
      score: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  scoreHistory: [
    {
      interviewId: { type: String, required: true },
      role: { type: String, required: true },
      overallScore: { type: Number, required: true },
      technicalScore: { type: Number, required: true },
      communicationScore: { type: Number, required: true },
      confidenceScore: { type: Number, required: true },
      eyeContactScore: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// 8. Roadmaps Schema
export interface IRoadmap extends Document {
  userId: string;
  resultId: string; // Report ID or Resume ID that triggered it
  role: string;
  skillsToImprove: string[];
  studyPlan: string; // general summary statement
  weeklyRoadmap: Array<{
    week: string; // e.g. "Week 1"
    objective: string;
    topics: string[];
    resources: string[];
  }>;
  resources: string[];
  learningSequence: string[];
  createdAt: Date;
}

const RoadmapSchema = new Schema<IRoadmap>({
  userId: { type: String, required: true, index: true },
  resultId: { type: String, required: true, index: true },
  role: { type: String, required: true },
  skillsToImprove: [{ type: String }],
  studyPlan: { type: String, required: true },
  weeklyRoadmap: [
    {
      week: { type: String, required: true },
      objective: { type: String, required: true },
      topics: [{ type: String }],
      resources: [{ type: String }],
    },
  ],
  resources: [{ type: String }],
  learningSequence: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

// Check if mongoose models already exist to avoid OverwriteModelError
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export const Resume: Model<IResume> = mongoose.models.Resume || mongoose.model<IResume>("Resume", ResumeSchema);
export const Interview: Model<IInterview> = mongoose.models.Interview || mongoose.model<IInterview>("Interview", InterviewSchema);
export const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>("Question", QuestionSchema);
export const Answer: Model<IAnswer> = mongoose.models.Answer || mongoose.model<IAnswer>("Answer", AnswerSchema);
export const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);
export const Analytics: Model<IAnalytics> = mongoose.models.Analytics || mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);
export const Roadmap: Model<IRoadmap> = mongoose.models.Roadmap || mongoose.model<IRoadmap>("Roadmap", RoadmapSchema);
