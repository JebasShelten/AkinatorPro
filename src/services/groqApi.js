const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

/**
 * Helper to make a secure, lightweight POST request to Groq.
 */
async function fetchGroq(systemPrompt, userMessage) {
  if (!API_KEY) {
    console.error("Groq API Key is missing! Check your .env file.");
    return null;
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Fast, highly efficient, and uses very few credits
        response_format: { type: "json_object" }, // Forces structured output
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Error communicating with Groq:", error);
    return null;
  }
}

/**
 * Service to generate random categories or categories based on user input.
 */
export const generateCategories = async (inputKeyword = "") => {
  const systemPrompt = `You are a game category generator for an Akinator clone. 
  Return a JSON object containing an array of exactly 5 interesting, distinct pop-culture or general knowledge categories. 
  Format: { "categories": ["Category 1", "Category 2", ...] }`;

  const userMessage = inputKeyword 
    ? `Generate 5 categories related to or inspired by: "${inputKeyword}"` 
    : "Generate 5 completely random and exciting categories for a guessing game.";

  return fetchGroq(systemPrompt, userMessage);
};

/**
 * Service to calculate the next question or make a guess based on history.
 */
export const getNextAction = async (category, history) => {
  const systemPrompt = `You are the ultimate Akinator engine. Your goal is to deduce what character, object, or entity the player is thinking of within the category: "${category}".
  
  Analyze the history of questions and answers provided.
  You must respond with a JSON object following one of these two formats:
  
  If you are still searching (under 20 questions):
  { "type": "question", "text": "Is your character a female?" }
  
  If you are at least 85% confident you know the answer:
  { "type": "guess", "character": "Thalapathy Vijay" }
  
  Keep your questions clever, minimizing the total count to save game memory.`;

  const userMessage = JSON.stringify({ category, history });
  return fetchGroq(systemPrompt, userMessage);
};