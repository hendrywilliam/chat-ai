import 'dotenv/config'
import { GoogleGenerativeAI } from "@google/generative-ai";

export const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY as string)