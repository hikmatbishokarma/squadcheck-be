import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private model: any;
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('geminiApiKey');
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  async generateGymInsights(users: Array<{
    fitnessLevel?: string;
    workoutFocus?: string;
    currentStreak?: number;
    preferredTime?: string;
  }>): Promise<{ energy: string; insights: string[] }> {
    if (users.length === 0) {
      return { energy: 'LOW', insights: ['Be the first to check in today.'] };
    }

    if (!this.model) {
      return this.computeFallbackInsights(users);
    }

    try {
      const hour = new Date().getHours();
      const time = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
      const focusSummary = users
        .filter((u) => u.workoutFocus)
        .map((u) => u.workoutFocus)
        .join(', ');
      const avgStreak = Math.round(
        users.reduce((s, u) => s + (u.currentStreak ?? 0), 0) / users.length,
      );

      const prompt = `You are observing a live gym session. ${users.length} people are currently training.
Time of day: ${time}. Average streak: ${avgStreak} days. Workout focuses: ${focusSummary || 'mixed'}.

Generate a JSON response with exactly these fields:
{
  "energy": "HIGH" | "MEDIUM" | "LOW",
  "insights": ["short ambient observation", "short ambient observation"]
}

Rules:
- energy is HIGH if ${users.length} >= 5, MEDIUM if >= 3, LOW otherwise
- insights are 2 short lines (max 8 words each), purely observational and motivational
- reference the actual workout focuses or time of day naturally
- do NOT mention squads, teams, or social features
- Return ONLY valid JSON, no markdown`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text().trim();
      const clean = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(clean);
    } catch (error) {
      this.logger.error('Gemini insights failed, using fallback', error.message);
      return this.computeFallbackInsights(users);
    }
  }

  private computeFallbackInsights(users: Array<{
    workoutFocus?: string;
    currentStreak?: number;
  }>): { energy: string; insights: string[] } {
    const count = users.length;
    const energy = count >= 6 ? 'HIGH' : count >= 3 ? 'MEDIUM' : 'LOW';
    const insights: string[] = [];

    // Dominant workout focus
    const focusCount: Record<string, number> = {};
    users.forEach((u) => {
      if (u.workoutFocus) focusCount[u.workoutFocus] = (focusCount[u.workoutFocus] ?? 0) + 1;
    });
    const topFocus = Object.entries(focusCount).sort((a, b) => b[1] - a[1])[0];
    if (topFocus) insights.push(`${topFocus[0]} is dominating today`);

    // Streak energy
    const avgStreak = users.reduce((s, u) => s + (u.currentStreak ?? 0), 0) / users.length;
    if (avgStreak >= 10) insights.push('Strong consistency energy in the gym');
    else if (avgStreak >= 5) insights.push('Momentum is building fast');

    // Time-based fallback
    const hour = new Date().getHours();
    if (insights.length < 2) {
      if (hour < 12) insights.push('Morning dedication energy is high');
      else if (hour < 17) insights.push('Afternoon crowd showing up strong');
      else insights.push('Evening momentum is rising');
    }

    return { energy, insights: insights.slice(0, 2) };
  }
}
