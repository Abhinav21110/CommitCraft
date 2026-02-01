import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/layout/Header";
import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { RepoPreviewList, type FileNode } from "@/components/dashboard/RepoPreviewList";
import { CommitTimeline, type CommitEntry } from "@/components/dashboard/CommitTimeline";
import { LogFeed, type LogEntry } from "@/components/dashboard/LogFeed";
import { ConfirmModal } from "@/components/dashboard/ConfirmModal";
import { Play, Pause, StopCircle, ExternalLink, GitBranch, FileCode, Clock } from "lucide-react";

// Mock data for demo
const mockFiles: FileNode[] = [
  {
    name: "src",
    type: "folder",
    path: "src",
    children: [
      { name: "index.ts", type: "file", path: "src/index.ts" },
      { name: "config.ts", type: "file", path: "src/config.ts" },
      {
        name: "utils",
        type: "folder",
        path: "src/utils",
        children: [
          { name: "helpers.ts", type: "file", path: "src/utils/helpers.ts" },
          { name: "logger.ts", type: "file", path: "src/utils/logger.ts" },
        ],
      },
      {
        name: "components",
        type: "folder",
        path: "src/components",
        children: [
          { name: "App.tsx", type: "file", path: "src/components/App.tsx" },
          { name: "Header.tsx", type: "file", path: "src/components/Header.tsx" },
        ],
      },
    ],
  },
  { name: "package.json", type: "file", path: "package.json" },
  { name: "README.md", type: "file", path: "README.md" },
  { name: ".gitignore", type: "file", path: ".gitignore" },
  { name: "tsconfig.json", type: "file", path: "tsconfig.json" },
];

const mockCommits: CommitEntry[] = [
  {
    id: "1",
    message: "Initial project setup with TypeScript configuration",
    type: "feat",
    file: "tsconfig.json",
    timestamp: "2 days ago at 9:15 AM",
    status: "completed",
  },
  {
    id: "2",
    message: "Add package.json with dependencies",
    type: "feat",
    file: "package.json",
    timestamp: "2 days ago at 10:30 AM",
    status: "completed",
  },
  {
    id: "3",
    message: "Create main entry point and config module",
    type: "feat",
    file: "src/index.ts",
    timestamp: "2 days ago at 2:45 PM",
    status: "in-progress",
  },
  {
    id: "4",
    message: "Add utility helper functions",
    type: "feat",
    file: "src/utils/helpers.ts",
    timestamp: "Yesterday at 11:00 AM",
  },
  {
    id: "5",
    message: "Fix configuration loading issue",
    type: "fix",
    file: "src/config.ts",
    timestamp: "Yesterday at 3:20 PM",
  },
  {
    id: "6",
    message: "Add logging utility module",
    type: "feat",
    file: "src/utils/logger.ts",
    timestamp: "Today at 9:00 AM",
  },
  {
    id: "7",
    message: "Update README with installation instructions",
    type: "docs",
    file: "README.md",
    timestamp: "Today at 10:15 AM",
  },
];

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Settings state
  const [repoName, setRepoName] = useState("my-awesome-project");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [genre, setGenre] = useState("web");
  const [commitCount, setCommitCount] = useState(25);
  const [humanization, setHumanization] = useState("medium");

  // Run state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [runComplete, setRunComplete] = useState(false);
  const [createdRepoUrl, setCreatedRepoUrl] = useState<string>("");
  const [createdRepoId, setCreatedRepoId] = useState<string>("");

  // Real data from API
  const [realCommits, setRealCommits] = useState<CommitEntry[]>([]);
  const [realFiles, setRealFiles] = useState<FileNode[]>([]);
  const [repoStats, setRepoStats] = useState({ commits: 0, files: 0, branches: 1 });

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const fetchRepoData = useCallback(async (repoId: string) => {
    try {
      const token = localStorage.getItem('authToken');

      // Fetch commits
      const commitsResponse = await fetch(`http://localhost:3000/api/repos/${repoId}/commits`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (commitsResponse.ok) {
        const { commits: githubCommits } = await commitsResponse.json();
        const formattedCommits: CommitEntry[] = githubCommits.map((commit: any, index: number) => ({
          id: commit.sha,
          message: commit.commit.message,
          type: commit.commit.message.includes('feat') ? 'feat' as const : 
                commit.commit.message.includes('fix') ? 'fix' as const : 'feat' as const,
          file: commit.files?.[0]?.filename || 'multiple files',
          timestamp: new Date(commit.commit.author.date).toLocaleString(),
          status: index === 0 ? 'completed' as const : undefined,
        }));
        setRealCommits(formattedCommits);
        setRepoStats(prev => ({ ...prev, commits: formattedCommits.length }));
      }

      // Fetch repository contents
      const contentsResponse = await fetch(`http://localhost:3000/api/repos/${repoId}/contents`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (contentsResponse.ok) {
        const { contents } = await contentsResponse.json();
        const formattedFiles: FileNode[] = Array.isArray(contents) 
          ? contents.map((item: any) => ({
              name: item.name,
              type: item.type === 'dir' ? 'folder' as const : 'file' as const,
              path: item.path,
            }))
          : [];
        setRealFiles(formattedFiles);
        setRepoStats(prev => ({ ...prev, files: formattedFiles.length }));
      }
    } catch (error) {
      console.error('Failed to fetch repo data:', error);
    }
  }, []);

  // Poll for updates when repo is created
  useEffect(() => {
    if (!createdRepoId) return;

    // Initial fetch
    fetchRepoData(createdRepoId);

    // Poll every 30 seconds for updates
    const interval = setInterval(() => {
      fetchRepoData(createdRepoId);
    }, 30000);

    return () => clearInterval(interval);
  }, [createdRepoId, fetchRepoData]);

  const handlePreview = useCallback(() => {
    // In real app, this would fetch preview data from API
    console.log("Preview requested");
  }, []);

  const handleConfirmRun = useCallback(async () => {
    if (!user) return;
    
    // Prevent duplicate runs
    if (runComplete || isConfirming) return;

    setIsConfirming(true);
    setShowConfirmModal(false);

    try {
      // Create repository
      setLogs([
        {
          id: "1",
          timestamp: new Date().toLocaleTimeString(),
          message: "Creating repository on GitHub...",
          type: "loading",
        },
      ]);

      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const createRepoResponse = await fetch('http://localhost:3000/api/repos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: repoName,
          description: description || undefined,
          private: isPrivate,
          autoInit: true,
        }),
      });

      if (!createRepoResponse.ok) {
        const errorData = await createRepoResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create repository (${createRepoResponse.status})`);
      }

      const { repo } = await createRepoResponse.json();
      setCreatedRepoUrl(repo.htmlUrl);
      setCreatedRepoId(repo.id);

      setLogs((prev) => [
        ...prev,
        {
          id: "2",
          timestamp: new Date().toLocaleTimeString(),
          message: `Repository created: ${repo.fullName}`,
          type: "success",
        },
      ]);

      // Fetch initial contents and commits
      fetchRepoData(repo.id);

      // Create schedule for commits
      setLogs((prev) => [
        ...prev,
        {
          id: "3",
          timestamp: new Date().toLocaleTimeString(),
          message: "Setting up commit schedule...",
          type: "loading",
        },
      ]);

      const scheduleResponse = await fetch('http://localhost:3000/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          repoId: repo.id,
          commitsPerRun: Math.min(commitCount, 10), // Max 10 per run
          frequency: 'daily',
        }),
      });

      if (!scheduleResponse.ok) {
        throw new Error('Failed to create schedule');
      }

      const { schedule } = await scheduleResponse.json();

      // Trigger immediate execution of scheduled commits
      setLogs((prev) => [
        ...prev,
        {
          id: "4",
          timestamp: new Date().toLocaleTimeString(),
          message: "Creating initial commits...",
          type: "loading",
        },
      ]);

      const executeResponse = await fetch(`http://localhost:3000/api/schedules/${schedule.id}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (executeResponse.ok) {
        setLogs((prev) => [
          ...prev.slice(0, -1), // Remove the loading message
          {
            id: "4",
            timestamp: new Date().toLocaleTimeString(),
            message: "Initial commits created!",
            type: "success",
          },
        ]);
        
        // Fetch updated data
        setTimeout(() => fetchRepoData(repo.id), 3000);
      } else {
        setLogs((prev) => [
          ...prev.slice(0, -1), // Remove the loading message
          {
            id: "4",
            timestamp: new Date().toLocaleTimeString(),
            message: "Failed to create initial commits",
            type: "error",
          },
        ]);
      }

      setLogs((prev) => [
        ...prev,
        {
          id: "5",
          timestamp: new Date().toLocaleTimeString(),
          message: `Repository is ready at: ${repo.htmlUrl}`,
          type: "success",
        },
      ]);

      setIsConfirming(false);
      setRunComplete(true);
    } catch (error: any) {
      setLogs((prev) => [
        ...prev,
        {
          id: String(prev.length + 1),
          timestamp: new Date().toLocaleTimeString(),
          message: `Error: ${error.message}`,
          type: "error",
        },
      ]);
      setIsConfirming(false);
    }
  }, [user, repoName, description, isPrivate, commitCount]);

  const handlePause = useCallback(() => {
    setIsPaused(!isPaused);
    setLogs((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        timestamp: new Date().toLocaleTimeString(),
        message: isPaused ? "Resuming run..." : "Run paused",
        type: "info",
      },
    ]);
  }, [isPaused]);

  const handleAbort = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setProgress(0);
    setLogs((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        timestamp: new Date().toLocaleTimeString(),
        message: "Run aborted by user",
        type: "error",
      },
    ]);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        isLoggedIn={true} 
        username={user.username} 
        avatarUrl={user.avatarUrl || "https://github.com/ghost.png"} 
      />

      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Activity Booster
          </h1>
          <p className="text-muted-foreground">
            Configure your repository and preview commits before running
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Settings */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-primary" />
                Settings
              </h2>
              <SettingsForm
                repoName={repoName}
                onRepoNameChange={setRepoName}
                description={description}
                onDescriptionChange={setDescription}
                isPrivate={isPrivate}
                onPrivateChange={setIsPrivate}
                genre={genre}
                onGenreChange={setGenre}
                commitCount={commitCount}
                onCommitCountChange={setCommitCount}
                humanization={humanization}
                onHumanizationChange={setHumanization}
                onPreview={handlePreview}
                isLoading={isRunning}
              />
            </div>
          </div>

          {/* Center Column: Preview */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Preview */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-primary" />
                File Preview
              </h2>
              <div className="space-y-2">
                {realFiles.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Preview mode - Real structure will appear after creation</p>
                )}
                <RepoPreviewList files={realFiles.length > 0 ? realFiles : mockFiles} repoName={repoName} />
              </div>
            </div>

            {/* Commit Timeline */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Commit Timeline
              </h3>
              <div className="space-y-2">
                {realCommits.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Preview mode - Real commits will appear after creation</p>
                )}
                <CommitTimeline commits={realCommits.length > 0 ? realCommits : mockCommits} />
              </div>
            </div>
          </div>

          {/* Right Column: Run Panel */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sticky top-24 space-y-6">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Live Run Panel
              </h2>

              {/* Progress */}
              {(isRunning || runComplete) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-2">
                {!isRunning && !runComplete && (
                  <Button
                    variant="default"
                    className="flex-1 gap-2"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={!repoName.trim()}
                  >
                    <Play className="w-4 h-4" />
                    Confirm & Run
                  </Button>
                )}
                {isRunning && (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={handlePause}
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-4 h-4" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="w-4 h-4" />
                          Pause
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      className="gap-2"
                      onClick={handleAbort}
                    >
                      <StopCircle className="w-4 h-4" />
                      Abort
                    </Button>
                  </>
                )}
                {runComplete && (
                  <Button
                    variant="success"
                    className="flex-1 gap-2"
                    onClick={() => window.open(createdRepoUrl || `https://github.com/${user.username}/${repoName}`, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open repository
                  </Button>
                )}
              </div>

              {/* Log Feed */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Activity Log
                </h3>
                <LogFeed logs={logs} />
              </div>

              {/* Analytics (after run) */}
              {runComplete && (
                <div className="p-4 rounded-2xl bg-success-muted border border-success/20 space-y-3">
                  <h3 className="text-sm font-semibold text-success">
                    Run Complete! 🎉
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{repoStats.commits}</p>
                      <p className="text-xs text-muted-foreground">Commits</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{repoStats.files}</p>
                      <p className="text-xs text-muted-foreground">Files</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{repoStats.branches}</p>
                      <p className="text-xs text-muted-foreground">Branch</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ConfirmModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        repoName={repoName}
        commitCount={commitCount}
        onConfirm={handleConfirmRun}
        isLoading={isConfirming}
      />
    </div>
  );
}
