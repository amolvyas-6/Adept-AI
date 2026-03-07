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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FloatingThemeToggle } from "@/components/mode-toggle";
import { BookOpen, Loader2, UserCheck } from "lucide-react";

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
        <Loader2 className="size-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-fade-in" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-rose-500/10 dark:bg-rose-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-fade-in delay-500" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-border/50 bg-card/60 backdrop-blur-xl shadow-xl animate-fade-in-up">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-muted rounded-xl border border-border/50">
              <UserCheck className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Complete your profile
          </CardTitle>
          <CardDescription>
            {userEmail ? (
              <>
                Signed in as{" "}
                <span className="font-medium text-foreground">{userEmail}</span>
                . Fill in your details to get started.
              </>
            ) : (
              "Fill in your details to get started with Adept AI."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
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
              <Label htmlFor="university">University</Label>
              <Select
                onValueChange={(val) => {
                  setSelectedUniversity(val);
                  setValue("universityId", val);
                  setValue("deptId", "");
                }}
              >
                <SelectTrigger
                  className={errors.universityId ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select your university" />
                </SelectTrigger>
                <SelectContent>
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
              <Label htmlFor="department">Department</Label>
              <Select
                onValueChange={(val) => setValue("deptId", val)}
                disabled={!selectedUniversity || loadingDepartments}
              >
                <SelectTrigger
                  className={errors.deptId ? "border-destructive" : ""}
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
                <SelectContent>
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
              className="w-full text-white bg-indigo-600 hover:bg-indigo-500"
              type="submit"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <BookOpen className="mr-2 h-4 w-4" />
              Complete Profile
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out and use a different account
            </button>
          </div>
        </CardContent>
      </Card>

      <FloatingThemeToggle />
    </div>
  );
}
