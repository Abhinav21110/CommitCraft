import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repoName: string;
  commitCount: number;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmModal({
  open,
  onOpenChange,
  repoName,
  commitCount,
  onConfirm,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-warning-muted">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <DialogTitle className="text-xl">Confirm actions</DialogTitle>
          </div>
          <DialogDescription className="pt-4 text-base">
            This will create a repository named{" "}
            <code className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-sm">
              {repoName}
            </code>{" "}
            in your GitHub account and make{" "}
            <span className="font-semibold text-foreground">{commitCount} commits</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50 text-sm">
            <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
            <span className="text-muted-foreground">
              You may preview or abort at any time during the process.
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm & Run"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
