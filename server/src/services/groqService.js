/**
 * Groq AI Service
 * Requires: npm install groq-sdk  (in server/)
 * Requires: GROQ_API_KEY in server/.env
 *
 * Get your free API key at: https://console.groq.com
 */

// Uncomment once you run: npm install groq-sdk
// const Groq = require('groq-sdk');
// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Summarise a note's content using Groq's LLaMA model.
 * @param {string} text - The note content to summarise
 * @returns {Promise<string>} - A short summary
 */
const generateSummary = async (text) => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not set in environment variables');
    }

    // Uncomment once groq-sdk is installed:
    // const completion = await groq.chat.completions.create({
    //     model: 'llama3-8b-8192',
    //     messages: [
    //         {
    //             role: 'system',
    //             content: 'You are a helpful assistant. Summarise the following note in 2-3 sentences.',
    //         },
    //         { role: 'user', content: text },
    //     ],
    //     max_tokens: 200,
    // });
    // return completion.choices[0].message.content;

    // Placeholder until SDK is installed
    return `Summary: ${text.substring(0, 100)}...`;
};

/**
 * Generate MCQ questions from a note's content.
 * @param {string} text - The note content
 * @param {number} count - Number of questions (default 3)
 * @returns {Promise<Array>} - Array of question strings
 */
const generateMCQs = async (text, count = 3) => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not set in environment variables');
    }

    // Uncomment once groq-sdk is installed:
    // const completion = await groq.chat.completions.create({
    //     model: 'llama3-8b-8192',
    //     messages: [
    //         {
    //             role: 'system',
    //             content: `Generate ${count} multiple choice questions from the following note. Return as a JSON array of strings.`,
    //         },
    //         { role: 'user', content: text },
    //     ],
    //     max_tokens: 500,
    // });
    // try {
    //     return JSON.parse(completion.choices[0].message.content);
    // } catch {
    //     return [completion.choices[0].message.content];
    // }

    // Placeholder until SDK is installed
    return Array.from({ length: count }, (_, i) => `Question ${i + 1} about: ${text.substring(0, 40)}...`);
};

module.exports = {
    generateSummary,
    generateMCQs,
};
