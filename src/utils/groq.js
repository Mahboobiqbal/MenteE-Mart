import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Enable browser usage
});

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