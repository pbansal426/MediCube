import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure this key is in your .env file
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { symptoms } = req.body;

        if (!symptoms || symptoms.length === 0) {
            return res.status(400).json({ message: "Symptoms are required" });
        }

        try {
            // Using OpenAI's chat completion API
            const aiResponse = await openai.chat.completions.create({
                model: "gpt-4", // or "gpt-3.5-turbo"
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a helpful medical assistant. Respond with a list of possible medications, their dosages, and side effects based on the user's symptoms.",
                    },
                    {
                        role: "user",
                        content: `User has the following symptoms: ${symptoms.join(", ")}. Provide medication recommendations with dosage and possible side effects.`,
                    },
                ],
            });

            const responseMessage = aiResponse.choices[0].message.content;

            // Send back the response from AI
            res.status(200).json({ response: responseMessage });
        } catch (error) {
            console.error("OpenAI error:", error);
            res.status(500).json({ message: "Error fetching AI response", error: error.message });
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}