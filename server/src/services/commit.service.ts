import { GenerateCommitRequest, AnalyzeCommitRequest } from '../types/commit.types.js';
import { geminiService } from './gemini.service.js';
import prisma from '../lib/prisma.js';

class CommitService {
  async generateCommitMessage(data: GenerateCommitRequest) {
    const { diff, context, type } = data;
    
    try {
      const result = await geminiService.generateCommitMessage({
        diff,
        context,
        type: type as 'conventional' | 'descriptive' | 'concise',
      });

      return {
        suggestions: result.suggestions.map((message, index) => ({
          message,
          confidence: 0.9 - (index * 0.1),
          description: result.reasoning,
        })),
        type,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      // Fallback if Gemini fails
      console.error('Gemini API error:', error.message);
      
      return {
        suggestions: [
          {
            message: 'feat: add new feature based on diff',
            confidence: 0.5,
            description: 'Auto-generated commit message (Gemini unavailable)',
          },
        ],
        type,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async analyzeCommitMessage(data: AnalyzeCommitRequest) {
    const { message } = data;
    
    try {
      const analysis = await geminiService.analyzeCommitMessage(message);
      
      return {
        score: analysis.score,
        feedback: analysis.feedback,
        suggestions: analysis.suggestions,
        conventionalCommit: analysis.isConventional,
      };
    } catch (error: any) {
      console.error('Gemini API error:', error.message);
      
      // Fallback analysis
      const isConventional = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build)(\(.+\))?:/.test(message);
      
      return {
        score: isConventional ? 70 : 50,
        feedback: isConventional 
          ? ['Follows conventional commit format'] 
          : ['Consider using conventional commit format'],
        suggestions: ['Add more context in the commit body'],
        conventionalCommit: isConventional,
      };
    }
  }

  async getCommitHistory(limit: number = 10, userId?: string) {
    const where = userId ? { userId } : {};
    
    const commits = await prisma.commit.findMany({
      where,
      include: {
        repo: {
          select: {
            name: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return {
      commits,
      total: commits.length,
      limit,
    };
  }
}

export const commitService = new CommitService();
