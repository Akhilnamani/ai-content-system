import mongoose from 'mongoose';

interface FlaggedClaim {
  claim: string;
  riskLevel: 'high' | 'medium' | 'low';
  suggestion: string;
  sources?: string[];
}

interface IContent {
  userId: mongoose.Types.ObjectId;
  title: string;
  topic: string;
  contentType: 'Article' | 'Blog Post' | 'Tutorial' | 'Guide' | 'Case Study' | 'Research Paper';
  tone: 'Professional' | 'Casual' | 'Academic' | 'Friendly' | 'Technical' | 'Inspirational';
  content: string;
  aiModel: 'hugging-face' | 'groq' | 'replicate' | 'mock';
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // NEW: Quality & Hallucination Detection Fields
  qualityScore?: number; // 0-100
  qualityDetails?: {
    wordCount: number;
    sentenceCount: number;
    readabilityScore: number; // Flesch-Kincaid
    structureScore: number; // Has headings, lists, etc
    uniqueWordsRatio: number; // Word diversity
  };
  flaggedClaims?: FlaggedClaim[];
  factCheckStatus?: 'verified' | 'flagged' | 'needs-review' | 'not-checked';
  halluccinationRisk?: 'high' | 'medium' | 'low' | 'none';
  complianceStatus?: {
    isPlagiarismRisk: boolean;
    hasInappropriateContent: boolean;
    seoScore?: number;
  };
}

const flaggedClaimSchema = new mongoose.Schema<FlaggedClaim>(
  {
    claim: {
      type: String,
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    suggestion: {
      type: String,
      required: true,
    },
    sources: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const qualityDetailsSchema = new mongoose.Schema(
  {
    wordCount: Number,
    sentenceCount: Number,
    readabilityScore: Number,
    structureScore: Number,
    uniqueWordsRatio: Number,
  },
  { _id: false }
);

const complianceStatusSchema = new mongoose.Schema(
  {
    isPlagiarismRisk: { type: Boolean, default: false },
    hasInappropriateContent: { type: Boolean, default: false },
    seoScore: Number,
  },
  { _id: false }
);

const contentSchema = new mongoose.Schema<IContent>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    contentType: {
      type: String,
      enum: ['Article', 'Blog Post', 'Tutorial', 'Guide', 'Case Study', 'Research Paper'],
      default: 'Article',
    },
    tone: {
      type: String,
      enum: ['Professional', 'Casual', 'Academic', 'Friendly', 'Technical', 'Inspirational'],
      default: 'Professional',
    },
    content: {
      type: String,
      required: true,
    },
    aiModel: {
      type: String,
      enum: ['hugging-face', 'groq', 'replicate', 'mock'],
      default: 'hugging-face',
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    
    // NEW: Quality & Hallucination Detection Fields
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    qualityDetails: qualityDetailsSchema,
    flaggedClaims: [flaggedClaimSchema],
    factCheckStatus: {
      type: String,
      enum: ['verified', 'flagged', 'needs-review', 'not-checked'],
      default: 'not-checked',
    },
    halluccinationRisk: {
      type: String,
      enum: ['high', 'medium', 'low', 'none'],
      default: 'none',
    },
    complianceStatus: complianceStatusSchema,
  },
  { timestamps: true }
);

contentSchema.index({ userId: 1, createdAt: -1 });
contentSchema.index({ userId: 1, factCheckStatus: 1 });
contentSchema.index({ userId: 1, qualityScore: -1 });

export const Content = mongoose.model<IContent>('Content', contentSchema);
