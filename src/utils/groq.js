import Groq from "groq-sdk";

// Prefer Vite-exposed variable. Keep fallback checks for other environments.
// Only read Node's process.env when it exists (server-side). In the browser use Vite's import.meta.env.
const apiKey =
  (import.meta && import.meta.env && import.meta.env.VITE_GROQ_API_KEY) ||
  (import.meta && import.meta.env && import.meta.env.GROQ_API_KEY) ||
  undefined;

let groq = null;
try {
  if (!apiKey) {
    // Do not let the Groq SDK throw an unhelpful error in the browser.
    // We'll log a clear message and keep `groq` null so callers can handle it gracefully.
    console.warn(
      "GROQ API key is missing. Set `VITE_GROQ_API_KEY` in your `.env` (and restart the dev server). See README for details."
    );
  }

  groq = new Groq({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // Enable browser usage
  });
} catch (err) {
  console.error(
    "Failed to initialize Groq client. Ensure VITE_GROQ_API_KEY is set in .env and restart the dev server.",
    err
  );
  groq = null;
}

export const fetchDescription = async (query) => {
  if (!groq) {
    throw new Error("GROQ client is not configured. Check your .env file.");
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `{Rules to follow:
          - no Inroducing lins wrapping
          - always be attractive toword products
          
          ${query}}`,
        },
      ],
      model: "llama3-70b-8192", // Replace with the appropriate model if needed
    });

    const description = completion.choices[0]?.message?.content;

    if (!description) {
      throw new Error("Failed to fetch description");
    }

    return description;
  } catch (error) {
    console.error("GROQ fetch error:", error);
    throw new Error(`Description generation failed: ${error.message}`);
  }
};
