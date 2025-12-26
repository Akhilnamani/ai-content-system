import express, { Router, Request, Response } from 'express';
import { Content } from '../models/Content';
import { authMiddleware } from '../middleware/auth';

const router: Router = express.Router();

// Apply auth middleware
router.use(authMiddleware);

// Generate content with mock data
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { title, topic, contentType, tone } = req.body;
    const userId = (req as any).userId;

    console.log('🔵 Generate request:', { title, topic, contentType, tone });

    // Validate input
    if (!title || !topic || !contentType || !tone) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    // Generate mock content
    const mockContent = `
# ${title}

## Overview
This is a ${tone} article about ${topic}, generated for demonstration purposes.

## Introduction
${topic} is an increasingly important topic in today's world. Understanding its nuances and implications is crucial for staying informed.

## Key Points

### 1. Importance and Relevance
${topic} has become a significant area of focus, with widespread implications across multiple industries and sectors.

### 2. Current Trends
The landscape of ${topic} continues to evolve rapidly, with new developments emerging regularly. Industry experts highlight several key trends that are shaping the future.

### 3. Best Practices
When dealing with ${topic}, it's essential to follow best practices such as:
- Staying informed about latest developments
- Understanding core concepts thoroughly
- Implementing proven strategies
- Continuous learning and adaptation

## Challenges and Opportunities
While ${topic} presents certain challenges, it also opens up numerous opportunities for innovation and growth.

## Future Outlook
Looking ahead, ${topic} is expected to play an even more significant role, with emerging technologies and methodologies creating new possibilities.

## Conclusion
${topic} represents a critical area of focus for anyone seeking to stay competitive and informed. By understanding its fundamentals and staying abreast of developments, individuals and organizations can better position themselves for success.

---
**Generated:** ${new Date().toLocaleString()}
**Content Type:** ${contentType}
**Tone:** ${tone}
    `.trim();

    console.log('✅ Mock content generated');

    // Save to database
    const content = new Content({
      userId,
      title,
      topic,
      contentType,
      tone,
      content: mockContent,
    });

    await content.save();
    console.log('✅ Content saved to database');

    res.status(201).json({
      message: 'Content generated successfully',
      content,
    });
  } catch (error: any) {
    console.error('❌ Generate content error:', error.message);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// Get all content for user
router.get('/list', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const contents = await Content.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Content retrieved successfully',
      contents,
    });
  } catch (error) {
    console.error('List content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single content
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const content = await Content.findOne({ _id: id, userId });

    if (!content) {
      res.status(404).json({ message: 'Content not found' });
      return;
    }

    res.status(200).json({
      message: 'Content retrieved successfully',
      content,
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete content
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const content = await Content.findOneAndDelete({ _id: id, userId });

    if (!content) {
      res.status(404).json({ message: 'Content not found' });
      return;
    }

    res.status(200).json({
      message: 'Content deleted successfully',
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
