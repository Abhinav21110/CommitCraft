import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary">
                <svg
                  className="w-4 h-4 text-primary-foreground"
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
              <span className="font-semibold text-foreground">ActivityBoost</span>
            </Link>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} ActivityBoost. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              to="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors duration-180"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors duration-180"
            >
              Privacy Policy
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors duration-180"
            >
              GitHub App
            </a>
          </div>
        </div>

        {/* Trust Statement */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-center text-xs text-muted-foreground max-w-2xl mx-auto">
            CommitCraft uses secure OAuth authentication and only requests the minimum permissions needed.
            We never store your GitHub password. All repository actions are previewed before execution.
          </p>
        </div>
      </div>
    </footer>
  );
}
