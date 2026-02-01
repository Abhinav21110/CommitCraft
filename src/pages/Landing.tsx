import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GitHubIcon, ShieldIcon, PreviewIcon } from "@/components/icons/Icons";
import { Shield, Eye, Zap, FileCode, Clock, GitBranch } from "lucide-react";
import heroPattern from "@/assets/hero-pattern.jpg";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <img
            src={heroPattern}
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

        <div className="container relative py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-up">
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Build your GitHub activity with{" "}
              <span className="text-primary">humanized commits</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Create realistic repository structures and commit patterns that look natural.
              Preview everything before any action is taken. Secure OAuth—we never store passwords.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/login">
                <Button variant="hero" className="gap-2 min-w-[220px]">
                  <GitHubIcon className="w-5 h-5" />
                  Sign in with GitHub
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="heroSecondary" className="min-w-[180px]">
                  How it works
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-y border-border bg-secondary/30">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-5 h-5 text-primary" />
              <span>OAuth consent only</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="w-5 h-5 text-primary" />
              <span>Preview before action</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-5 h-5 text-primary" />
              <span>No passwords stored</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How ActivityBoost works
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to create realistic GitHub activity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Templates */}
            <div className="group p-8 rounded-3xl border border-border bg-card hover:border-primary/30 hover:shadow-soft-lg transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-primary-muted flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <FileCode className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Smart Templates
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Choose from web apps, CLI tools, data science projects, and more. 
                Each template generates realistic file structures and content.
              </p>
            </div>

            {/* Feature 2: Humanized Commits */}
            <div className="group p-8 rounded-3xl border border-border bg-card hover:border-primary/30 hover:shadow-soft-lg transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-primary-muted flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Humanized Commits
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Control commit frequency and size. Sparse, medium, or busy patterns 
                that mimic natural development workflows.
              </p>
            </div>

            {/* Feature 3: Preview & Safety */}
            <div className="group p-8 rounded-3xl border border-border bg-card hover:border-primary/30 hover:shadow-soft-lg transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-primary-muted flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <GitBranch className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Preview & Safety
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                See exactly what files and commits will be created before running. 
                Pause or abort at any time during execution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Ready to boost your GitHub activity?
            </h2>
            <p className="text-muted-foreground">
              Get started in seconds with secure GitHub authentication.
            </p>
            <Link to="/login">
              <Button variant="hero" className="gap-2">
                <GitHubIcon className="w-5 h-5" />
                Sign in with GitHub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
