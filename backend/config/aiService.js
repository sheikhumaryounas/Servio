import dotenv from 'dotenv';
dotenv.config();

/**
 * Call Gemini 1.5 Flash API with the provided contents
 * @param {Array} contents Request contents in Gemini format
 * @returns {Promise<Object>} The parsed and cleaned JSON response
 */
export const callAI = async (contents) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleanedText);
};

// Alias for backwards compatibility
export const callGemini = callAI;
