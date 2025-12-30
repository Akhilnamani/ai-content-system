import express, { Router, Request, Response } from 'express';
import { Content } from '../models/Content';
import { authMiddleware } from '../middleware/auth';
import { generateContentWithAI, getAvailableModels } from '../services/aiService';
import { analyzeContentQuality } from '../services/qualityService';
import { performFactCheck } from '../services/factCheckService';


const router: Router = express.Router();


// Apply auth middleware
router.use(authMiddleware);


// Get available AI models
router.get('/models', (req: Request, res: Response) => {
  try {
    const availableModels = getAvailableModels();
    console.log('📋 Available models:', availableModels.map((m) => m.id));


    res.status(200).json({
      message: 'Available models retrieved',
      models: availableModels,
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Generate content with selected AI model
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { title, topic, contentType, tone, aiModel } = req.body;
    const userId = (req as any).userId;


    console.log('🔵 Generate request:', { title, topic, contentType, tone, aiModel });


    // Validate input
    if (!title || !topic || !contentType || !tone || !aiModel) {
      res.status(400).json({ message: 'All fields including AI model are required' });
      return;
    }


    // Generate content with selected AI
    const { content: generatedContent, model: usedModel } = await generateContentWithAI({
      title,
      topic,
      contentType,
      tone,
      model: aiModel,
    });


    console.log(`✅ Content generated with ${usedModel}`);


    // NEW: Analyze quality
    const qualityAnalysis = analyzeContentQuality(generatedContent, contentType);
    console.log(`📊 Quality Score: ${qualityAnalysis.qualityScore}/100`);


    // NEW: Perform fact-check
    const { flaggedClaims, factCheckStatus } = await performFactCheck(generatedContent);
    console.log(`🔍 Fact-check Status: ${factCheckStatus}`);


    // Save to database with quality & fact-check data
    const content = new Content({
      userId,
      title,
      topic,
      contentType,
      tone,
      content: generatedContent,
      aiModel: usedModel,
      // NEW: Quality fields
      qualityScore: qualityAnalysis.qualityScore,
      qualityDetails: qualityAnalysis.qualityDetails,
      halluccinationRisk: qualityAnalysis.halluccinationRisk,
      // NEW: Fact-check fields
      flaggedClaims,
      factCheckStatus,
      complianceStatus: {
        isPlagiarismRisk: false,
        hasInappropriateContent: false,
      },
    });


    await content.save();
    console.log('✅ Content saved with quality analysis');


    res.status(201).json({
      message: 'Content generated successfully',
      content,
      aiModel: usedModel,
      quality: {
        score: qualityAnalysis.qualityScore,
        risk: qualityAnalysis.halluccinationRisk,
        flaggedClaims: flaggedClaims.length,
      },
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


// Update content
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = (req as any).userId;


    console.log('🔵 Update request:', { id, title });


    if (!title || !content) {
      res.status(400).json({ message: 'Title and content are required' });
      return;
    }


    const updatedContent = await Content.findOneAndUpdate(
      { _id: id, userId },
      { title, content },
      { new: true }
    );


    if (!updatedContent) {
      res.status(404).json({ message: 'Content not found' });
      return;
    }


    console.log('✅ Content updated');


    res.status(200).json({
      message: 'Content updated successfully',
      content: updatedContent,
    });
  } catch (error: any) {
    console.error('❌ Update content error:', error.message);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
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


// ============= FEATURE 1 & 2: SHARE ROUTES =============

// Generate shareable link (no auth required for viewing)
router.post('/:id/share', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const content = await Content.findOne({ _id: id, userId });

    if (!content) {
      res.status(404).json({ message: 'Content not found' });
      return;
    }

    const shareLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/share/${id}`;
    console.log('✅ Share link generated:', shareLink);

    res.status(200).json({
      message: 'Share link generated',
      shareLink,
      contentId: id,
      title: content.title,
    });
  } catch (error) {
    console.error('❌ Error generating share link:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get shared content (PUBLIC - no auth required)
router.get('/public/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const content = await Content.findOne({ _id: id }).select(
      'title topic contentType tone content createdAt aiModel qualityScore halluccinationRisk qualityDetails'
    );

    if (!content) {
      res.status(404).json({ message: 'Content not found' });
      return;
    }

    console.log('✅ Public content retrieved:', content.title);

    res.status(200).json({
      message: 'Content retrieved',
      content,
    });
  } catch (error) {
    console.error('❌ Error fetching public content:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// ============= FEATURE 3: REGENERATE ROUTES =============

// REGENERATE CONTENT ROUTE
router.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newTone, focusArea } = req.body;
    const userId = (req as any).userId;

    console.log('🔵 Regenerate request:', { id, newTone, focusArea });

    const content = await Content.findOne({ _id: id, userId });

    if (!content) {
      res.status(404).json({ message: 'Content not found' });
      return;
    }

    // Generate new content with different tone
    const { content: generatedContent, model: usedModel } = await generateContentWithAI({
      title: content.title,
      topic: content.topic,
      contentType: content.contentType,
      tone: newTone,
      model: content.aiModel || 'gpt-3.5-turbo',
    });

    console.log('✅ New content generated with tone:', newTone);

    // Analyze quality of new content
    const qualityAnalysis = analyzeContentQuality(generatedContent, content.contentType);
    
    // Perform fact-check on new content
    const { flaggedClaims, factCheckStatus } = await performFactCheck(generatedContent);

    console.log(`📊 Quality Score: ${qualityAnalysis.qualityScore}/100`);

    // Update content
    const updatedContent = await Content.findByIdAndUpdate(
      id,
      {
        content: generatedContent,
        tone: newTone,
        qualityScore: qualityAnalysis.qualityScore,
        halluccinationRisk: qualityAnalysis.halluccinationRisk,
        flaggedClaims: flaggedClaims,
        factCheckStatus: factCheckStatus,
        qualityDetails: qualityAnalysis.qualityDetails,
        aiModel: usedModel,
        regeneratedFrom: id,
        regenerationNotes: {
          originalTone: content.tone,
          newTone,
          focusArea,
          regeneratedAt: new Date(),
        },
      },
      { new: true }
    );

    console.log('✅ Content regenerated successfully');

    res.status(200).json({
      message: 'Content regenerated successfully',
      content: updatedContent,
      qualityImprovement: {
        oldScore: content.qualityScore || 0,
        newScore: qualityAnalysis.qualityScore,
        improvement: (qualityAnalysis.qualityScore - (content.qualityScore || 0)).toFixed(2),
      },
    });
  } catch (error) {
    console.error('❌ Error regenerating content:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// GET REGENERATION HISTORY
router.get('/:id/regenerations', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const content = await Content.findOne({ _id: id, userId });

    if (!content) {
      res.status(404).json({ message: 'Content not found' });
      return;
    }

    const history = await Content.find({
      regeneratedFrom: id,
      userId,
    }).select('tone qualityScore halluccinationRisk createdAt regenerationNotes');

    res.status(200).json({
      message: 'Regeneration history retrieved',
      original: {
        tone: content.tone,
        qualityScore: content.qualityScore,
      },
      versions: history,
    });
  } catch (error) {
    console.error('❌ Error fetching regeneration history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


export default router;
