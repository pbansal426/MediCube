import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "", // Ensure this key is in your .env.local file
});

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAIResponse(symptoms: string, retries: number = 0): Promise<string> {
    try {
        const aiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a helpful medical assistant. Respond with a list of possible medications, their dosages, and side effects based on the user's symptoms.",
                },
                {
                    role: "user",
                    content: `User has the following symptoms: ${symptoms}. Provide medication recommendations with dosage and possible side effects.`,
                },
            ],
        });

        return aiResponse.choices[0].message.content;
    } catch (error: any) {
        if (error.status === 429 && retries < MAX_RETRIES) {
            console.warn(`Rate limit exceeded. Retrying in ${RETRY_DELAY} ms...`);
            await sleep(RETRY_DELAY);
            return fetchAIResponse(symptoms, retries + 1);
        } else {
            throw error;
        }
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { symptoms } = req.body;

        if (!symptoms || symptoms.length === 0) {
            return res.status(400).json({ message: "Symptoms are required" });
        }

        try {
            const responseMessage = await fetchAIResponse(symptoms);
            res.status(200).json({ response: responseMessage });
        } catch (error) {
            console.error("OpenAI error:", error);
            res.status(500).json({ message: "Error fetching AI response", error: error.message });
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}