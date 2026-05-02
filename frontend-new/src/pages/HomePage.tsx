import { Link } from "react-router";
import { BookOpen, Library, GraduationCap, ArrowRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 20, stiffness: 100 },
  },
};

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground px-6 md:px-12 lg:px-24 font-sans overflow-hidden">
      {/* Ambient Depth Backgrounds */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-dim/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <motion.div 
        className="relative z-10 max-w-[1400px] mx-auto flex flex-col min-h-screen"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Spatial Masthead */}
        <motion.header variants={itemVariants} className="h-24 flex items-center justify-between pt-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-[0.75rem] bg-surface-container-high border border-white/5 shadow-[0_0_15px_rgba(96,99,238,0.1)]">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">Adept AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              className="rounded-full font-medium label-md"
            >
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </motion.header>

        {/* Editorial Hero Section */}
        <main className="flex-1 flex flex-col justify-center py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <motion.div className="lg:col-span-8 space-y-8" variants={containerVariants}>
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel label-sm text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-dim opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Neural Horizon Protocol Active
              </motion.div>

              <motion.h1 variants={itemVariants} className="display-lg">
                Master your curriculum with <br />
                <span className="gradient-text">intelligent resources.</span>
              </motion.h1>

              <motion.p variants={itemVariants} className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                Access a centralized library of course materials, track your
                progress, and organize your learning journey in one seamless spatial layout.
              </motion.p>

              <motion.div variants={itemVariants} className="pt-8 flex flex-col sm:flex-row gap-6 items-start">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-8 h-14 text-base"
                >
                  <Link to="/signup" className="group flex items-center gap-2">
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="rounded-full px-8 h-14 text-base"
                >
                  <Link to="/login">Explore Library</Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Asymmetrical Visual Element */}
            <motion.div 
              variants={itemVariants} 
              className="hidden lg:flex lg:col-span-4 justify-end relative"
            >
              <div className="relative w-full max-w-[400px] aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-dim to-secondary rounded-[2rem] opacity-20 blur-2xl animate-pulse" />
                <div className="relative h-full w-full glass-panel rounded-[2rem] p-8 flex flex-col justify-between overflow-hidden shadow-[0_20px_40px_rgba(99,102,241,0.08)]">
                   <div className="space-y-4">
                     <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center border border-white/5">
                        <Library className="w-5 h-5 text-primary" />
                     </div>
                     <h3 className="headline-lg text-2xl">Curated Sync</h3>
                     <p className="text-muted-foreground">Your materials, automatically organized and deeply analyzed.</p>
                   </div>
                   <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden mt-8">
                     <div className="h-full bg-gradient-to-r from-primary to-secondary w-2/3 animate-[pulse_2s_ease-in-out_infinite]" />
                   </div>
                </div>
              </div>
            </motion.div>

          </div>
        </main>

        {/* Staggered Features */}
        <motion.section variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
          <FeatureCard
            icon={<Library className="w-6 h-6 text-primary" />}
            title="Digital Library"
            description="Browse and save documents from various courses directly to your personal collection."
          />
          <FeatureCard
            icon={<GraduationCap className="w-6 h-6 text-secondary" />}
            title="Department Focused"
            description="Tailored resources organized by department to help you find exactly what you need."
          />
          <FeatureCard
            icon={<BookOpen className="w-6 h-6 text-tertiary" />}
            title="Smart Learning"
            description="Curated content designed to enhance your understanding and academic performance."
          />
        </motion.section>

        {/* Footer */}
        <motion.footer variants={itemVariants} className="py-8 border-t border-white/5 text-center text-sm text-muted-foreground label-md">
          © {new Date().getFullYear()} Adept AI Learning Systems. All rights reserved.
        </motion.footer>
      </motion.div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <motion.div variants={itemVariants}>
    <div className="bg-surface-container-low border border-white/5 rounded-[1rem] p-8 h-full flex flex-col gap-6 hover:shadow-[0_20px_40px_rgba(99,102,241,0.08)] transition-all duration-500 group">
      <div className="w-14 h-14 rounded-[0.75rem] bg-surface-container-highest flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-semibold tracking-tight mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  </motion.div>
);
