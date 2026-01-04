import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY' || apiKey === 'your_gemini_api_key_here') {
  console.error('Gemini API key missing. Set VITE_GEMINI_API_KEY in your .env');
}

const genAI = new GoogleGenerativeAI(apiKey || '', {
  apiVersion: 'v1',
  baseUrl: 'https://generativelanguage.googleapis.com/v1'
});

const getModelWithFallback = async (primary, fallback) => {
  try {
    return genAI.getGenerativeModel({ model: primary, apiVersion: 'v1' });
  } catch (err) {
    console.warn(`Primary model ${primary} unavailable, trying fallback ${fallback}`, err);
    return genAI.getGenerativeModel({ model: fallback, apiVersion: 'v1' });
  }
};

export const analyzeSymptoms = async (symptoms) => {
  try {
    const model = await getModelWithFallback('models/gemini-2.0-flash', 'models/gemini-1.5-flash');

    const prompt = `You are a medical AI assistant. Analyze the following symptoms and provide:
                    1. Risk level (Low, Medium, High)
                    2. Possible conditions (list 3-5 most likely conditions)
                    3. Medical advice (what should the person do)
                    4. When to seek immediate medical attention

                    Symptoms: ${symptoms}

                    Provide the response in JSON format:
                    {
                    "riskLevel": "Low|Medium|High",
                    "conditions": ["condition1", "condition2", "condition3"],
                    "advice": "detailed advice",
                    "urgency": "when to seek medical help"
                    }

                    Important: This is for informational purposes only and not a replacement for professional medical advice.`;

  console.log('[Gemini] analyzeSymptoms: prompt length', prompt.length);

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
  console.log('[Gemini] analyzeSymptoms: response length', text?.length || 0);
    
   
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonStr);
      }
      return JSON.parse(text);
    } catch (parseError) {
      // If parsing fails, return structured data from text
      return {
        riskLevel: text.includes('High') ? 'High' : text.includes('Medium') ? 'Medium' : 'Low',
        conditions: ['Please consult the full analysis'],
        advice: text,
        urgency: 'Consult a healthcare professional for accurate diagnosis'
      };
    }
  } catch (error) {
    console.error('[Gemini] Error analyzing symptoms:', error);
    throw new Error(error?.message || 'Failed to analyze symptoms. Please try again.');
  }
};

export const chatWithAI = async (message, chatHistory = []) => {
  try {
    const model = await getModelWithFallback('models/gemini-2.0-flash', 'models/gemini-1.5-flash');

    // Build conversation history
    const conversationContext = chatHistory.map(msg => 
      `${msg.role === 'user' ? 'Patient' : 'AI'}: ${msg.content}`
    ).join('\n');

    const prompt = `You are a compassionate medical AI assistant. Provide helpful, accurate health information.

                    Previous conversation:
                    ${conversationContext}

                    Patient: ${message}

                    AI Assistant:`;

    console.log('[Gemini] chatWithAI: prompt length', prompt.length);

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log('[Gemini] chatWithAI: response length', text?.length || 0);
    return text;
  } catch (error) {
    console.error('[Gemini] Error in chat:', error);
    throw new Error(error?.message || 'Failed to get response. Please try again.');
  }
};

export default genAI;
