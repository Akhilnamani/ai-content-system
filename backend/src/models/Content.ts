import mongoose from 'mongoose';

interface IContent {
  userId: mongoose.Types.ObjectId;
  title: string;
  topic: string;
  contentType: 'blog' | 'social' | 'email' | 'ad';
  tone: 'professional' | 'casual' | 'creative' | 'technical';
  content: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

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
    },
    topic: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      enum: ['blog', 'social', 'email', 'ad'],
      default: 'blog',
    },
    tone: {
      type: String,
      enum: ['professional', 'casual', 'creative', 'technical'],
      default: 'professional',
    },
    content: {
      type: String,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Content = mongoose.model<IContent>('Content', contentSchema);
