import {GoogleGenAI} from "@google/genai";

export const googleGenAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
export const GEMINI_EMBEDDING_MODEL = "gemini-embedding-exp-03-07"