export interface JWTPayload {
  userId: string;
  githubId: string;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export interface ScheduleConfig {
  frequency: 'hourly' | 'daily' | 'weekly' | 'custom';
  cronExpression?: string;
  commitsPerRun: number;
}

export interface CreateRepoRequest {
  name: string;
  description?: string;
  private?: boolean;
  autoInit?: boolean;
}

export interface CommitRequest {
  repoId: string;
  message?: string;
  files: {
    path: string;
    content: string;
  }[];
  branch?: string;
}

export interface ScheduleCommitRequest {
  repoId: string;
  frequency: string;
  cronExpression?: string;
  commitsPerRun?: number;
}
