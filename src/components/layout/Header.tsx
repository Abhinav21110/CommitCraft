import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/icons/Icons";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isLoggedIn?: boolean;
  username?: string;
  avatarUrl?: string;
}

export function Header({ isLoggedIn = false, username, avatarUrl }: HeaderProps) {
  const location = useLocation();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <svg
              className="w-5 h-5 text-primary-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <span className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-180">
            ActivityBoost
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/docs"
            className={cn(
              "text-sm font-medium transition-colors duration-180 hover:text-primary",
              location.pathname === "/docs" ? "text-primary" : "text-muted-foreground"
            )}
          >
            Docs
          </Link>
          <Link
            to="/security"
            className={cn(
              "text-sm font-medium transition-colors duration-180 hover:text-primary",
              location.pathname === "/security" ? "text-primary" : "text-muted-foreground"
            )}
          >
            Security
          </Link>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={username}
                    className="w-6 h-6 rounded-full ring-2 ring-background"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      {username?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-foreground">{username}</span>
              </div>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="github" className="gap-2">
                <GitHubIcon className="w-4 h-4" />
                Sign in with GitHub
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
