import dotenv from 'dotenv';
dotenv.config();

/**
 * Call Google Gemini 1.5 Flash API with custom contents
 * @param {Array} contents Gemini contents format
 * @returns {Promise<Object>} Cleaned JSON response from Gemini
 */
export const callGemini = async (contents) => {
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
