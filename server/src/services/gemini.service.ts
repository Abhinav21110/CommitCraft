import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateCommitMessage(data: {
    diff: string;
    context?: string;
    projectDescription?: string;
    type?: 'conventional' | 'descriptive' | 'concise';
  }): Promise<{ suggestions: string[]; reasoning: string }> {
    const { diff, context, projectDescription, type = 'conventional' } = data;

    let prompt = `You are a commit message expert. Analyze the following git diff and generate commit messages.

Git Diff:
\`\`\`
${diff}
\`\`\`
`;

    if (projectDescription) {
      prompt += `\n\nProject Context:\n${projectDescription}\n`;
    }

    if (context) {
      prompt += `\n\nAdditional Context:\n${context}\n`;
    }

    prompt += `\n\nGenerate 3 commit messages in ${type} format:`;

    if (type === 'conventional') {
      prompt += `
- Use conventional commit format: type(scope): description
- Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build
- Keep messages clear and under 72 characters
- First line should be the summary, then blank line, then optional detailed explanation`;
    } else if (type === 'descriptive') {
      prompt += `
- Use clear, descriptive English
- Explain WHAT changed and WHY
- Be detailed but concise`;
    } else {
      prompt += `
- Keep it very short and to the point
- One line only
- Focus on the main change`;
    }

    prompt += `\n\nProvide your response in JSON format:
{
  "suggestions": ["commit message 1", "commit message 2", "commit message 3"],
  "reasoning": "Brief explanation of the changes detected"
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          suggestions: parsed.suggestions || [],
          reasoning: parsed.reasoning || '',
        };
      }

      // Fallback if JSON parsing fails
      return {
        suggestions: [
          'feat: update codebase',
          'fix: resolve issues',
          'refactor: improve code structure',
        ],
        reasoning: 'Could not parse AI response',
      };
    } catch (error: any) {
      throw new Error(`Failed to generate commit message: ${error.message}`);
    }
  }

  async analyzeCommitMessage(message: string): Promise<{
    score: number;
    feedback: string[];
    isConventional: boolean;
    suggestions: string[];
  }> {
    const prompt = `Analyze this commit message and provide feedback:

Commit Message:
"${message}"

Evaluate it based on:
1. Clarity and descriptiveness
2. Follows best practices
3. Grammar and formatting
4. Conventional commit format compliance

Provide your analysis in JSON format:
{
  "score": <number 0-100>,
  "feedback": ["point 1", "point 2"],
  "isConventional": <boolean>,
  "suggestions": ["improvement 1", "improvement 2"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: parsed.score || 50,
          feedback: parsed.feedback || [],
          isConventional: parsed.isConventional || false,
          suggestions: parsed.suggestions || [],
        };
      }

      return {
        score: 50,
        feedback: ['Unable to analyze commit message'],
        isConventional: false,
        suggestions: [],
      };
    } catch (error: any) {
      throw new Error(`Failed to analyze commit message: ${error.message}`);
    }
  }

  async generateCodeChanges(
    instruction: string,
    projectDescription?: string
  ): Promise<{
    files: { path: string; content: string }[];
    explanation: string;
  }> {
    let prompt = `Generate code changes based on this instruction:

"${instruction}"`;

    if (projectDescription) {
      prompt += `\n\nProject Context:
"${projectDescription}"

Use this project context to generate more relevant and appropriate code changes.`;
    }

    prompt += `

Provide realistic code changes that would be committed to a repository.
Return your response in JSON format:
{
  "files": [
    {
      "path": "path/to/file.ext",
      "content": "file content here"
    }
  ],
  "explanation": "Brief explanation of what was changed"
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          files: parsed.files || [],
          explanation: parsed.explanation || '',
        };
      }

      return {
        files: [
          {
            path: 'README.md',
            content: '# Auto-generated commit\n\n' + instruction,
          },
        ],
        explanation: 'Generated basic README update',
      };
    } catch (error: any) {
      throw new Error(`Failed to generate code changes: ${error.message}`);
    }
  }
}

export const geminiService = new GeminiService();
