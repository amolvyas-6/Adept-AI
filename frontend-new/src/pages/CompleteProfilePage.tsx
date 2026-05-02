import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  universityId: z.string().min(1, "Please select a university"),
  deptId: z.string().min(1, "Please select a department"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function CompleteProfilePage() {
  const navigate = useNavigate();
  const {
    loading: authLoading,
    isAuthenticated,
    isProfileComplete,
    user,
    refreshProfile,
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState<
    { id: string; name: string }[]
  >([]);
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedUniversity, setSelectedUniversity] = useState<string>("");
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const userEmail = user?.email || "";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    } else if (isProfileComplete) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, isAuthenticated, isProfileComplete, navigate]);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const data = await api.getUniversities();
        setUniversities(data);
      } catch (error) {
        console.error("Failed to fetch universities", error);
        toast.error("Failed to load universities. Please try again later.");
      }
    };
    fetchUniversities();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!selectedUniversity) {
        setDepartments([]);
        return;
      }
      setLoadingDepartments(true);
      try {
        const data = await api.getDepartments(selectedUniversity);
        setDepartments(data);
      } catch (error) {
        console.error("Failed to fetch departments", error);
        toast.error("Failed to load departments. Please try again later.");
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepartments();
  }, [selectedUniversity]);

  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true);
    try {
      await api.createProfile({
        fullName: data.fullName,
        dept_id: data.deptId,
        university_id: data.universityId,
      });
      await refreshProfile();
      toast.success("Profile completed! Welcome to Adept AI.");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    navigate("/login");
  };

  if (authLoading || !isAuthenticated || isProfileComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-32 h-1 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-secondary w-1/2 animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden font-sans text-foreground">
      {/* Ambient Depth Backgrounds */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary-dim/10 blur-[120px] rounded-full mix-blend-screen animate-fade-in" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full mix-blend-screen animate-fade-in delay-500" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 100 }}
        className="w-full max-w-md relative z-10 glass-panel rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(99,102,241,0.08)]"
      >
        <div className="space-y-2 text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-[1rem] bg-surface-container-high border border-white/5 flex items-center justify-center shadow-[0_0_20px_rgba(96,99,238,0.2)]">
              <UserCheck className="w-7 h-7 text-primary" />
            </div>
          </div>
          <h1 className="headline-lg text-3xl">Complete Profile</h1>
          <p className="text-muted-foreground text-sm">
            {userEmail ? (
              <>
                Signed in as <span className="font-medium text-foreground">{userEmail}</span>. Fill in your details to get started.
              </>
            ) : (
              "Fill in your details to get started with Adept AI."
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="label-sm">Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              {...register("fullName")}
              className={errors.fullName ? "border-destructive" : ""}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="university" className="label-sm">University</Label>
            <Select
              onValueChange={(val) => {
                setSelectedUniversity(val);
                setValue("universityId", val);
                setValue("deptId", "");
              }}
            >
              <SelectTrigger
                className={errors.universityId ? "border-destructive" : "bg-surface-container-highest/50 border-white/5"}
              >
                <SelectValue placeholder="Select your university" />
              </SelectTrigger>
              <SelectContent className="bg-surface-container-highest border border-white/5 backdrop-blur-xl">
                {universities.map((uni) => (
                  <SelectItem key={uni.id} value={uni.id}>
                    {uni.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.universityId && (
              <p className="text-xs text-destructive">
                {errors.universityId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="label-sm">Department</Label>
            <Select
              onValueChange={(val) => setValue("deptId", val)}
              disabled={!selectedUniversity || loadingDepartments}
            >
              <SelectTrigger
                className={errors.deptId ? "border-destructive" : "bg-surface-container-highest/50 border-white/5"}
              >
                <SelectValue
                  placeholder={
                    loadingDepartments
                      ? "Loading departments..."
                      : !selectedUniversity
                        ? "Select a university first"
                        : "Select your department"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-surface-container-highest border border-white/5 backdrop-blur-xl">
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.deptId && (
              <p className="text-xs text-destructive">
                {errors.deptId.message}
              </p>
            )}
          </div>

          <Button
            className="w-full h-12"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                Completing...
              </div>
            ) : (
              <>
                <BookOpen className="mr-2 h-5 w-5" />
                Complete Profile
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors outline-none"
          >
            Sign out and use a different account
          </button>
        </div>
      </motion.div>
    </div>
  );
}