import { z } from 'zod';

export const generateCommitSchema = z.object({
  diff: z.string().min(1, 'Diff is required'),
  context: z.string().optional(),
  type: z.enum(['conventional', 'descriptive', 'concise']).optional().default('conventional'),
});

export const analyzeCommitSchema = z.object({
  message: z.string().min(1, 'Commit message is required'),
});

export type GenerateCommitRequest = z.infer<typeof generateCommitSchema>;
export type AnalyzeCommitRequest = z.infer<typeof analyzeCommitSchema>;
