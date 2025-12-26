import mongoose from 'mongoose';

interface IContent {
  title: string;
  content: string;
  originalPrompt: string;
  status: 'draft' | 'pending' | 'approved' | 'published';
  tone: string;
  language: string;
  tags: string[];
  created_by: mongoose.Types.ObjectId;
  workspace_id?: mongoose.Types.ObjectId;
  metadata: {
    readabilityScore?: number;
    wordCount: number;
    estimatedReadTime: number;
  };
  verification_status?: 'verified' | 'uncertain' | 'false';
  createdAt: Date;
  updatedAt: Date;
}

const contentSchema = new mongoose.Schema<IContent>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    originalPrompt: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'published'],
      default: 'draft',
    },
    tone: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: 'en',
    },
    tags: [String],
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    metadata: {
      readabilityScore: Number,
      wordCount: Number,
      estimatedReadTime: Number,
    },
    verification_status: {
      type: String,
      enum: ['verified', 'uncertain', 'false'],
    },
  },
  { timestamps: true }
);

// Index for searching
contentSchema.index({ title: 'text', content: 'text', tags: 1 });

export const Content = mongoose.model<IContent>('Content', contentSchema);
