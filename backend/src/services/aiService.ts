import { HfInference } from '@huggingface/inference';
import Groq from 'groq-sdk';

// Initialize AI providers
const hf = process.env.HUGGING_FACE_API_KEY 
  ? new HfInference(process.env.HUGGING_FACE_API_KEY)
  : null;

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

interface ContentGenerationParams {
  title: string;
  topic: string;
  contentType: string;
  tone: string;
  model: string;
}

export const generateContentWithAI = async (
  params: ContentGenerationParams
): Promise<{ content: string; model: string }> => {
  const { title, topic, contentType, tone, model } = params;

  const prompt = `You are a professional content writer. Write a ${tone} ${contentType} about "${topic}".

Title: "${title}"

Requirements:
- Write 300-500 words
- Use markdown formatting
- Include clear sections with headers
- Make it informative and engaging
- Use a ${tone} tone throughout`;

  try {
    // Hugging Face Model
    if (model === 'hugging-face') {
      return await generateWithHuggingFace(prompt, title, topic, contentType, tone);
    }

    // Groq Model
    if (model === 'groq') {
      return await generateWithGroq(prompt, title, topic, contentType, tone);
    }

    // Replicate Model
    if (model === 'replicate') {
      return await generateWithReplicate(prompt, title, topic, contentType, tone);
    }

    // Fallback to Mock
    return {
      content: generateMockContent(title, topic, contentType, tone),
      model: 'mock',
    };
  } catch (error: any) {
    console.error(`❌ ${model} generation error:`, error.message);
    return {
      content: generateMockContent(title, topic, contentType, tone),
      model: 'mock',
    };
  }
};

// Hugging Face Implementation - FIXED
const generateWithHuggingFace = async (
  prompt: string,
  title: string,
  topic: string,
  contentType: string,
  tone: string
): Promise<{ content: string; model: string }> => {
  console.log('🔵 Using Hugging Face for content generation');

  if (!hf) {
    throw new Error('Hugging Face API key not configured');
  }

  try {
    // Use free, public model (doesn't need paid inference provider)
    const response = await hf.textGeneration({
      model: 'gpt2', // Free, always available
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.7,
        top_p: 0.9,
      },
    });

    const generatedText = response.generated_text;
    const content =
      generatedText.length > prompt.length
        ? generatedText.substring(prompt.length).trim()
        : generatedText;

    console.log('✅ Content generated with Hugging Face');
    return { content, model: 'hugging-face' };
  } catch (error: any) {
    console.error('Hugging Face error:', error.message);
    throw error;
  }
};

// Groq Implementation - FIXED
const generateWithGroq = async (
  prompt: string,
  title: string,
  topic: string,
  contentType: string,
  tone: string
): Promise<{ content: string; model: string }> => {
  console.log('🟠 Using Groq for content generation');

  if (!groq) {
    throw new Error('Groq API key not configured');
  }

  try {
    // Use newer, non-decommissioned model
    const message = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.1-70b-versatile', // Updated from mixtral-8x7b-32768
      max_tokens: 1024,
      temperature: 0.7,
    });

    const content = message.choices[0]?.message?.content || '';

    console.log('✅ Content generated with Groq');
    return { content, model: 'groq' };
  } catch (error: any) {
    console.error('Groq error:', error.message);
    throw error;
  }
};

// Replicate Implementation - FIXED
const generateWithReplicate = async (
  prompt: string,
  title: string,
  topic: string,
  contentType: string,
  tone: string
): Promise<{ content: string; model: string }> => {
  console.log('🟣 Using Replicate for content generation');

  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('Replicate API token not configured');
  }

  try {
    // Use Llama 2 70B Chat model (more reliable)
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '02e509c789964a7ea8526ff894f0a7210243f6d8559f51cfd3fc40603e9f7fd', // Llama 2 70B Chat
        input: {
          prompt: prompt,
          max_length: 500,
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Replicate API error:', errorData);
      throw new Error(`Replicate API error: ${response.status}`);
    }

    const prediction = await response.json() as any;

    if (!prediction.id) {
      throw new Error('Failed to create Replicate prediction');
    }

    // Poll for result (with timeout)
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max

    while (result.status === 'processing' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });

      if (!statusResponse.ok) {
        throw new Error(`Failed to check prediction status: ${statusResponse.status}`);
      }

      result = await statusResponse.json() as any;
      attempts++;
    }

    if (result.status === 'failed') {
      throw new Error('Replicate prediction failed');
    }

    if (result.status === 'canceled') {
      throw new Error('Replicate prediction was canceled');
    }

    if (result.status === 'processing') {
      throw new Error('Replicate request timed out');
    }

    const content = Array.isArray(result.output)
      ? result.output.join('')
      : result.output || '';

    if (!content) {
      throw new Error('No output from Replicate');
    }

    console.log('✅ Content generated with Replicate');
    return { content, model: 'replicate' };
  } catch (error: any) {
    console.error('Replicate error:', error.message);
    throw error;
  }
};

// Mock Content (Fallback)
const generateMockContent = (
  title: string,
  topic: string,
  contentType: string,
  tone: string
): string => {
  return `# ${title}

## Overview
This is a ${tone} article about ${topic}.

## Introduction
${topic} is an important subject that deserves attention and understanding in today's context.

## Key Points

### 1. Fundamental Concepts
Understanding the basics of ${topic} is essential for competence in this area.

### 2. Practical Applications
${topic} has numerous real-world applications across various industries and sectors.

### 3. Best Practices
When working with ${topic}, consider these important approaches:
- Research thoroughly before implementing
- Stay updated with latest developments
- Learn from industry experts
- Practice continuously

## Challenges & Opportunities
${topic} presents both challenges and opportunities that need careful consideration and strategic planning.

## Future Trends
The field of ${topic} is evolving rapidly with new innovations emerging regularly.

## Conclusion
${topic} is critical for modern professionals. Developing expertise can enhance career prospects and help you contribute meaningfully to your organization.

---
**Generated:** ${new Date().toLocaleString()}
**Type:** ${contentType}
**Tone:** ${tone}
**Model:** Mock (Demo)`;
};

// Get available models
export const getAvailableModels = (): { id: string; name: string; description: string; speed: string }[] => {
  const models = [
    {
      id: 'groq',
      name: '⚡ Groq (Llama 3.1)',
      description: 'Super fast, excellent quality',
      speed: '⚡⚡⚡',
    },
    {
      id: 'replicate',
      name: '🔮 Replicate (Llama 2)',
      description: 'High quality, moderate speed',
      speed: '⚡⚡',
    },
    {
      id: 'hugging-face',
      name: '🤗 Hugging Face (GPT-2)',
      description: 'Good quality, free model',
      speed: '⚡⚡',
    },
    {
      id: 'mock',
      name: '🤖 Demo Mode',
      description: 'Instant generation, no API needed',
      speed: '⚡⚡⚡⚡',
    },
  ];

  // Filter based on available API keys
  return models.filter((m) => {
    if (m.id === 'groq') return !!process.env.GROQ_API_KEY;
    if (m.id === 'replicate') return !!process.env.REPLICATE_API_TOKEN;
    if (m.id === 'hugging-face') return !!process.env.HUGGING_FACE_API_KEY;
    if (m.id === 'mock') return true; // Always available
    return false;
  });
};
