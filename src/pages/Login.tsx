import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GitHubIcon } from "@/components/icons/Icons";
import { Shield, CheckCircle2, ExternalLink, ArrowRight } from "lucide-react";

export default function Login() {
  const [showScopes, setShowScopes] = useState(false);
  
  // Mock: check if user has an existing session
  const hasExistingSession = false;
  const existingUser = {
    username: "johndoe",
    avatarUrl: "https://github.com/ghost.png",
  };

  const scopes = [
    {
      name: "repo",
      description: "Full control of private repositories",
      reason: "Required to create repositories and push commits",
    },
    {
      name: "read:user",
      description: "Read access to profile data",
      reason: "To display your username and avatar",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md animate-fade-up">
          {/* Main Card */}
          <div className="rounded-3xl border border-border bg-card p-8 shadow-soft-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-muted mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Sign in to ActivityBoost
              </h1>
              <p className="text-muted-foreground">
                Connect your GitHub account to get started
              </p>
            </div>

            {/* Existing Session */}
            {hasExistingSession && (
              <div className="mb-6 p-4 rounded-2xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={existingUser.avatarUrl}
                    alt={existingUser.username}
                    className="w-10 h-10 rounded-full ring-2 ring-background"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Welcome back, {existingUser.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You have an existing session
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" className="flex-1 gap-2">
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    Switch account
                  </Button>
                </div>
              </div>
            )}

            {/* OAuth Scopes Info */}
            <div className="mb-6 p-4 rounded-2xl bg-secondary/30 space-y-3">
              <p className="text-sm text-muted-foreground">
                We'll request the following permissions:
              </p>
              <div className="space-y-2">
                {scopes.map((scope) => (
                  <div key={scope.name} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <div>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                        {scope.name}
                      </code>
                      <span className="text-xs text-muted-foreground ml-2">
                        — {scope.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Dialog open={showScopes} onOpenChange={setShowScopes}>
                <DialogTrigger asChild>
                  <button className="text-xs text-primary hover:text-primary/80 underline underline-offset-2 transition-colors">
                    Why we need this
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Why we request these permissions</DialogTitle>
                    <DialogDescription>
                      ActivityBoost needs specific GitHub permissions to work properly.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    {scopes.map((scope) => (
                      <div key={scope.name} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-secondary px-2 py-1 rounded font-mono">
                            {scope.name}
                          </code>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {scope.reason}
                        </p>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        We only use these permissions to create repositories and push commits as you specify. 
                        We never access your existing repositories or personal data without explicit action.
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Sign In Button */}
            <Button variant="github" className="w-full h-12 text-base gap-2">
              <GitHubIcon className="w-5 h-5" />
              Sign in with GitHub
            </Button>

            {/* Trust Footer */}
            <p className="mt-6 text-center text-xs text-muted-foreground">
              By signing in, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Security Note */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Secured with OAuth 2.0 — We never see your password</span>
          </div>
        </div>
      </main>
    </div>
  );
}
