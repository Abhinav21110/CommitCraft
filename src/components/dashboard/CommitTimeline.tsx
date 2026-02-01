import { cn } from "@/lib/utils";
import { CommitBadge, type CommitType } from "@/components/icons/Icons";
import { Clock, GitCommit } from "lucide-react";

export interface CommitEntry {
  id: string;
  message: string;
  type: CommitType;
  file: string;
  timestamp: string;
  status?: "pending" | "in-progress" | "completed";
}

interface CommitTimelineProps {
  commits: CommitEntry[];
  className?: string;
}

export function CommitTimeline({ commits, className }: CommitTimelineProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {commits.map((commit, index) => (
        <div
          key={commit.id}
          className={cn(
            "relative flex items-start gap-3 p-3 rounded-lg transition-all duration-180",
            commit.status === "in-progress" && "bg-primary-muted border border-primary/20",
            commit.status === "completed" && "opacity-70",
            !commit.status && "hover:bg-secondary/50"
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Timeline connector */}
          {index < commits.length - 1 && (
            <div className="absolute left-[1.625rem] top-10 w-0.5 h-[calc(100%-1.5rem)] bg-border" />
          )}

          {/* Commit icon */}
          <div
            className={cn(
              "relative z-10 flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5",
              commit.status === "completed" && "bg-success text-success-foreground",
              commit.status === "in-progress" && "bg-primary text-primary-foreground animate-pulse-soft",
              !commit.status && "bg-muted text-muted-foreground"
            )}
          >
            <GitCommit className="w-3 h-3" />
          </div>

          {/* Commit content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CommitBadge type={commit.type} />
              <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {commit.file}
              </code>
            </div>
            <p className="mt-1 text-sm text-foreground truncate">{commit.message}</p>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{commit.timestamp}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
