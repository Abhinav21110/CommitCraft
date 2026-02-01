import { Octokit } from '@octokit/rest';
import prisma from '../lib/prisma.js';

export class GitHubService {
  private octokit: Octokit;
  private userId: string;

  constructor(accessToken: string, userId: string) {
    this.octokit = new Octokit({ auth: accessToken });
    this.userId = userId;
  }

  static async forUser(userId: string): Promise<GitHubService> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { accessToken: true },
    });

    if (!user || !user.accessToken) {
      throw new Error('User not found or no access token');
    }

    return new GitHubService(user.accessToken, userId);
  }

  async createRepository(data: {
    name: string;
    description?: string;
    private?: boolean;
    autoInit?: boolean;
  }) {
    try {
      const response = await this.octokit.repos.createForAuthenticatedUser({
        name: data.name,
        description: data.description || '',
        private: data.private || false,
        auto_init: data.autoInit !== false, // Default to true
      });

      const repo = await prisma.repo.create({
        data: {
          githubRepoId: String(response.data.id),
          name: response.data.name,
          fullName: response.data.full_name,
          description: response.data.description || undefined,
          private: response.data.private,
          defaultBranch: response.data.default_branch || 'main',
          htmlUrl: response.data.html_url,
          cloneUrl: response.data.clone_url,
          userId: this.userId,
        },
      });

      return repo;
    } catch (error: any) {
      throw new Error(`Failed to create repository: ${error.message}`);
    }
  }

  async listRepositories() {
    try {
      const response = await this.octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to list repositories: ${error.message}`);
    }
  }

  async getRepository(owner: string, repo: string) {
    try {
      const response = await this.octokit.repos.get({ owner, repo });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get repository: ${error.message}`);
    }
  }

  async createCommit(data: {
    owner: string;
    repo: string;
    message: string;
    files: { path: string; content: string }[];
    branch?: string;
  }) {
    try {
      const branch = data.branch || 'main';

      // Get the current commit SHA
      const { data: refData } = await this.octokit.git.getRef({
        owner: data.owner,
        repo: data.repo,
        ref: `heads/${branch}`,
      });

      const currentCommitSha = refData.object.sha;

      // Get the tree
      const { data: commitData } = await this.octokit.git.getCommit({
        owner: data.owner,
        repo: data.repo,
        commit_sha: currentCommitSha,
      });

      // Create blobs for each file
      const blobs = await Promise.all(
        data.files.map(async (file) => {
          const { data: blob } = await this.octokit.git.createBlob({
            owner: data.owner,
            repo: data.repo,
            content: Buffer.from(file.content).toString('base64'),
            encoding: 'base64',
          });
          return {
            path: file.path,
            mode: '100644' as const,
            type: 'blob' as const,
            sha: blob.sha,
          };
        })
      );

      // Create a new tree
      const { data: newTree } = await this.octokit.git.createTree({
        owner: data.owner,
        repo: data.repo,
        tree: blobs,
        base_tree: commitData.tree.sha,
      });

      // Create a new commit
      const { data: newCommit } = await this.octokit.git.createCommit({
        owner: data.owner,
        repo: data.repo,
        message: data.message,
        tree: newTree.sha,
        parents: [currentCommitSha],
      });

      // Update the reference
      await this.octokit.git.updateRef({
        owner: data.owner,
        repo: data.repo,
        ref: `heads/${branch}`,
        sha: newCommit.sha,
      });

      return newCommit;
    } catch (error: any) {
      throw new Error(`Failed to create commit: ${error.message}`);
    }
  }

  async createOrUpdateFile(data: {
    owner: string;
    repo: string;
    path: string;
    message: string;
    content: string;
    branch?: string;
  }) {
    try {
      const branch = data.branch || 'main';

      // Check if file exists
      let sha: string | undefined;
      try {
        const { data: existingFile } = await this.octokit.repos.getContent({
          owner: data.owner,
          repo: data.repo,
          path: data.path,
          ref: branch,
        });
        
        if ('sha' in existingFile) {
          sha = existingFile.sha;
        }
      } catch (error) {
        // File doesn't exist, that's okay
      }

      const response = await this.octokit.repos.createOrUpdateFileContents({
        owner: data.owner,
        repo: data.repo,
        path: data.path,
        message: data.message,
        content: Buffer.from(data.content).toString('base64'),
        branch,
        ...(sha && { sha }),
      });

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to create/update file: ${error.message}`);
    }
  }

  async deleteRepository(owner: string, repo: string) {
    try {
      await this.octokit.repos.delete({ owner, repo });
    } catch (error: any) {
      throw new Error(`Failed to delete repository: ${error.message}`);
    }
  }
}
