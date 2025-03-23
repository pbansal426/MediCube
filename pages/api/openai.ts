// pages/api/openai.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { OpenAI } from 'openai'

// Initialize OpenAI client with your API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Make sure to store your API key in environment variables
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { symptoms } = req.body

        try {
            // Send a prompt to the OpenAI API for medication suggestions
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful AI assistant providing medication suggestions based on symptoms.',
                    },
                    {
                        role: 'user',
                        content: `The user is describing symptoms: "${symptoms}". What are the medication suggestions, dosage, and potential side effects?`,
                    },
                ],
            })

            const message = response.choices[0].message.content

            // Process the response and send back a structured result
            res.status(200).json({
                medications: message, // You can parse this response further as needed
                dosage: 'Dosage details should be included in the AI response.',
                sideEffects: 'Side effects will be included as part of the AI response.',
            })
        } catch (error) {
            console.error('Error fetching OpenAI response:', error)
            res.status(500).json({ error: 'Failed to fetch AI response.' })
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' })
    }
}