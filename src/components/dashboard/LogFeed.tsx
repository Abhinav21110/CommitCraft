import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, AlertCircle, Info, Loader2 } from "lucide-react";

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "success" | "error" | "loading";
}

interface LogFeedProps {
  logs: LogEntry[];
  className?: string;
}

const logTypeConfig = {
  info: {
    icon: Info,
    colorClass: "text-info",
    bgClass: "bg-info-muted",
  },
  success: {
    icon: CheckCircle2,
    colorClass: "text-success",
    bgClass: "bg-success-muted",
  },
  error: {
    icon: AlertCircle,
    colorClass: "text-destructive",
    bgClass: "bg-destructive-muted",
  },
  loading: {
    icon: Loader2,
    colorClass: "text-primary",
    bgClass: "bg-primary-muted",
  },
};

export function LogFeed({ logs, className }: LogFeedProps) {
  return (
    <ScrollArea className={cn("h-64", className)}>
      <div className="space-y-2 p-1">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No activity yet. Click "Confirm & Run" to start.
          </div>
        ) : (
          logs.map((log, index) => {
            const config = logTypeConfig[log.type];
            const Icon = config.icon;

            return (
              <div
                key={log.id}
                className={cn(
                  "flex items-start gap-2 p-2 rounded-md text-sm animate-fade-up",
                  config.bgClass
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 mt-0.5",
                    config.colorClass,
                    log.type === "loading" && "animate-spin"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-muted-foreground font-mono text-xs">
                    {log.timestamp}
                  </span>
                  <p className="text-foreground mt-0.5">{log.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}
