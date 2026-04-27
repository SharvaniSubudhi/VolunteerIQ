import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export async function analyzeNGOText(text: string): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are the core intelligence and decision engine for an AI-powered system called "VolunteerIQ".
Your job is not just to analyze text, but to simulate real-world NGO decision-making in crisis situations.
You will receive messy, unstructured input (like WhatsApp messages or field reports) and convert it into structured, prioritized, and actionable outputs.

CORE OBJECTIVE:
Transform raw text into:
- Clearly separated issues
- Prioritized decisions
- Volunteer assignments
- Actionable deployment strategy

STEP 1: MULTI-ISSUE EXTRACTION
- Identify ALL distinct issues
- Never merge issues
- Each issue must be independent

STEP 2: ISSUE TITLE
- Generate a short title (2-5 words)

STEP 3: CATEGORY (STRICT)
Choose ONLY one:
- Food / Hunger
- Medical
- Shelter
- Education
- Infrastructure
- Other

STEP 4: URGENCY (STRICT)
Assign ONLY one:
- Critical
- High
- Medium
- Low

STEP 5: REASON
- Short explanation (max 12 words)

STEP 6: LOCATION
- Extract if present
- Else return "Unknown"

STEP 7: TIME CONTEXT
- Extract time reference if present (e.g., "2 days", "since last night")
- Else return "Not specified"

STEP 8: VOLUNTEER MATCHING (IMPROVED LOGIC)
- Medical → Medical
- Food / Hunger → Logistics
- Shelter → Construction or Logistics
- Education → Teaching
- Infrastructure → Construction
- Other → General Support

STEP 9: ACTION
- Short actionable instruction (max 10 words)

STEP 10: RISK (FOR HIGH & CRITICAL)
- Short consequence if ignored
- Else return "None"

STEP 11: PRIORITY SYSTEM
- Rank issues: Critical → High → Medium → Low
- Assign: priority_rank (1 = highest)

STEP 12: ATTENTION FLAG
- Critical → "🚨 Immediate Action Required"
- High → "⚠️ High Attention Needed"
- Medium → "Monitor"
- Low → "Low Priority"

STEP 13: TOP PRIORITY HIGHLIGHT
- The highest priority issue must include: "top_priority": true
- Others: "top_priority": false

STEP 14: DEPLOYMENT SUMMARY
After processing all issues, generate a summary with:
- total_issues
- critical_count
- high_count
- deployment_plan (1-2 lines summary of the strategy)

Input text to process:
"""
${text}
"""
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  issue_title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  location: { type: Type.STRING },
                  time_detected: { type: Type.STRING },
                  urgency: { type: Type.STRING },
                  priority_rank: { type: Type.INTEGER },
                  top_priority: { type: Type.BOOLEAN },
                  attention_flag: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  volunteer_type: { type: Type.STRING },
                  action: { type: Type.STRING },
                  risk_if_ignored: { type: Type.STRING },
                },
                required: [
                  "issue_title", "category", "location", "time_detected", "urgency", "priority_rank", 
                  "top_priority", "attention_flag", "reason", "volunteer_type", "action", "risk_if_ignored"
                ]
              }
            },
            summary: {
              type: Type.OBJECT,
              properties: {
                total_issues: { type: Type.INTEGER },
                critical_count: { type: Type.INTEGER },
                high_count: { type: Type.INTEGER },
                deployment_plan: { type: Type.STRING }
              },
              required: ["total_issues", "critical_count", "high_count", "deployment_plan"]
            }
          },
          required: ["issues", "summary"]
        }
      }
    });

    if (!response.text) {
        throw new Error("No response text returned");
    }

    const jsonStr = response.text.trim();
    const data: AnalysisResult = JSON.parse(jsonStr);
    
    // Sort array by priority rank just to be safe
    data.issues.sort((a, b) => a.priority_rank - b.priority_rank);
    return data;
  } catch (error) {
    console.error("Error analyzing text with Gemini:", error);
    throw error;
  }
}
