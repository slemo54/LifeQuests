
import { GoogleGenAI, Type } from "@google/genai";
import { Habit, UserStats, Difficulty } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getHabitSummary = (habits: Habit[]) => {
    return habits.map(h => {
      const recentCompletions = h.completionDates ? h.completionDates.slice(-3).join(", ") : "None";
      const totalCompletions = h.completionDates ? h.completionDates.length : 0;
      return `"${h.title}" (Difficulty: ${h.difficulty}, Streak: ${h.streak}, Total Completions: ${totalCompletions})`;
  }).join("\n");
};

export const getDailyBriefing = async (stats: UserStats, habits: Habit[]) => {
    const habitList = getHabitSummary(habits);
    const systemInstruction = `You are a medieval Quest Giver. 
    The hero (Level ${stats.level} ${stats.classTitle}) wakes up. 
    Look at their habits:
    ${habitList}
    
    1. Identify the most important/difficult task to start with today (based on streak or difficulty).
    2. Write a ONE sentence "Call to Adventure" for today. Motivational and epic.
    3. Return ONLY that sentence.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: "Give me my daily briefing.",
            config: { systemInstruction, temperature: 0.9 }
        });
        return response.text;
    } catch (e) {
        return "The sun rises on a new day, Hero. Glory awaits those who seize it!";
    }
};

export const getSpiritAdvice = async (stats: UserStats, habits: Habit[], message: string) => {
  const habitSummary = getHabitSummary(habits);
  
  const systemInstruction = `You are the "Great Quest Master", an ancient and wise spirit guide in a fantasy RPG habit tracker. 
  
  HERO STATS:
  - Class: ${stats.classTitle} (Level ${stats.level})
  - HP: ${stats.hp}/${stats.maxHp}
  
  ACTIVE QUESTS:
  ${habitSummary}
  
  MECHANICS:
  - Divine Shield protects streaks once/week.
  - Streaks build XP multipliers.
  
  GOAL:
  Analyze their consistency. If they ask "Why am I failing", look for patterns (low completions).
  If they ask "What next", suggest the habit with the lowest recent attention or highest difficulty.
  Speak in a fantasy/medieval tone. Keep responses concise.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Spirit Guide error:", error);
    return "The mists of the void are thick today, Hero. My wisdom is obscured. Keep your blade sharp regardless.";
  }
};

export const getDifficultySuggestion = async (title: string, description: string): Promise<Difficulty> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Quest Title: ${title}\nQuest Description: ${description}\n\nBased on the effort required, classify this habit as Easy, Medium, or Hard. Easy is 5 mins, Medium is 15-30 mins, Hard is 1hr+. Return ONLY the word.`,
      config: {
        temperature: 0.1,
      }
    });
    
    const text = response.text?.trim();
    if (text === 'Hard') return 'Hard';
    if (text === 'Medium') return 'Medium';
    return 'Easy';
  } catch (e) {
    return 'Easy';
  }
};
