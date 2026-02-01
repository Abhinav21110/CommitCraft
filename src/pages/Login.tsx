import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GitHubIcon } from "@/components/icons/Icons";
import { Shield, CheckCircle2, AlertCircle } from "lucide-react";

export default function Login() {
  const [showScopes, setShowScopes] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    login();
  };

  const errorMessages: Record<string, string> = {
    auth_failed: 'Authentication failed. Please try again.',
    no_user: 'Could not retrieve user information.',
    no_token: 'No authentication token received.',
  };

  const scopes = [
    {
      name: "repo",
      description: "Full control of private repositories",
      reason: "Required to create repositories and push commits",
    },
    {
      name: "user:email",
      description: "Read access to user email",
      reason: "To display your email and profile information",
    },
    {
      name: "write:repo_hook",
      description: "Write repository hooks",
      reason: "For advanced repository management features",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md animate-fade-up">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorMessages[error] || 'An error occurred during authentication.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-3xl border border-border bg-card p-8 shadow-soft-lg">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-muted mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Sign in to Commit Craft
              </h1>
              <p className="text-muted-foreground">
                Connect your GitHub account to get started
              </p>
            </div>

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
                      Commit Craft needs specific GitHub permissions to work properly.
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

            <Button 
              variant="github" 
              className="w-full h-12 text-base gap-2"
              onClick={handleLogin}
            >
              <GitHubIcon className="w-5 h-5" />
              Sign in with GitHub
            </Button>

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

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Secured with OAuth 2.0 — We never see your password</span>
          </div>
        </div>
      </main>
    </div>
  );
}
