import { Github, FileCode, Shield, Eye, Zap, Clock, GitBranch, FileText, Wrench, TestTube, BookOpen } from "lucide-react";

// Commit type badges with colors matching the design system
export type CommitType = "feat" | "fix" | "docs" | "test" | "chore" | "refactor";

interface CommitBadgeProps {
  type: CommitType;
  className?: string;
}

const commitTypeConfig: Record<CommitType, { label: string; icon: typeof FileCode; colorClass: string }> = {
  feat: {
    label: "feat",
    icon: Zap,
    colorClass: "bg-success-muted text-success",
  },
  fix: {
    label: "fix",
    icon: Wrench,
    colorClass: "bg-destructive-muted text-destructive",
  },
  docs: {
    label: "docs",
    icon: BookOpen,
    colorClass: "bg-info-muted text-info",
  },
  test: {
    label: "test",
    icon: TestTube,
    colorClass: "bg-warning-muted text-warning",
  },
  chore: {
    label: "chore",
    icon: FileText,
    colorClass: "bg-muted text-muted-foreground",
  },
  refactor: {
    label: "refactor",
    icon: GitBranch,
    colorClass: "bg-accent text-accent-foreground",
  },
};

export function CommitBadge({ type, className }: CommitBadgeProps) {
  const config = commitTypeConfig[type];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${config.colorClass} ${className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// GitHub icon component for consistency
export function GitHubIcon({ className }: { className?: string }) {
  return <Github className={className} />;
}

// Shield icon for security/trust
export function ShieldIcon({ className }: { className?: string }) {
  return <Shield className={className} />;
}

// Eye icon for preview
export function PreviewIcon({ className }: { className?: string }) {
  return <Eye className={className} />;
}

// Clock icon for timing/schedule
export function ClockIcon({ className }: { className?: string }) {
  return <Clock className={className} />;
}
