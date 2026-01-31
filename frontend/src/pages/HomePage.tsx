import { Link } from "react-router";
import { BookOpen, Library, GraduationCap, ArrowRight } from "lucide-react";
import { FloatingThemeToggle } from "../components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground px-6 font-sans selection:bg-indigo-500/30 overflow-hidden transition-colors duration-300">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-fade-in" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/10 dark:bg-rose-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-fade-in delay-500" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-20 flex items-center justify-between animate-fade-in-down">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-xl border border-border/50">
              <BookOpen className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            </div>
            <span className="text-xl font-bold tracking-tight">Adept AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="secondary"
              className="rounded-full font-medium"
            >
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col justify-center items-center text-center py-20">
          <div className="space-y-6 max-w-3xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border/50 text-xs font-medium text-muted-foreground mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Now available for all departments
            </div>

            <h1 className="text-5xl pb-1 md:text-7xl font-bold tracking-tight leading-[1.1] bg-linear-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
              Master your curriculum with intelligent resources.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Access a centralized library of course materials, track your
              progress, and organize your learning journey in one place.
            </p>

            <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 h-14 text-base bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-500/20"
              >
                <Link
                  to="/auth?mode=signup"
                  className="group flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-14 text-base border-border bg-background/50 backdrop-blur-sm"
              >
                <Link to="/auth">Log In</Link>
              </Button>
            </div>
          </div>
        </main>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20 animate-fade-in-up delay-200">
          <FeatureCard
            icon={
              <Library className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            }
            title="Digital Library"
            description="Browse and save documents from various courses directly to your personal collection."
            delay="delay-100"
          />
          <FeatureCard
            icon={
              <GraduationCap className="w-6 h-6 text-rose-500 dark:text-rose-400" />
            }
            title="Department Focused"
            description="Tailored resources organized by department to help you find exactly what you need."
            delay="delay-200"
          />
          <FeatureCard
            icon={
              <BookOpen className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
            }
            title="Smart Learning"
            description="Curated content designed to enhance your understanding and academic performance."
            delay="delay-300"
          />
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border/50 text-center text-sm text-muted-foreground animate-fade-in">
          © {new Date().getFullYear()} Adept AI Learning Systems. All rights
          reserved.
        </footer>
      </div>

      {/* Floating Theme Toggle */}
      <FloatingThemeToggle />
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: string;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => (
  <Card
    className={`border-border/50 bg-card/60 backdrop-blur-sm transition-all hover:bg-card hover:border-border hover:shadow-md group ${delay}`}
  >
    <CardHeader>
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <CardTitle className="text-xl tracking-tight">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-base text-muted-foreground leading-relaxed">
        {description}
      </CardDescription>
    </CardContent>
  </Card>
);
