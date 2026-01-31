import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { BookOpen, Loader2 } from "lucide-react";

// --- Schemas ---

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    universityId: z.string().min(1, "Please select a university"),
    deptId: z.string().min(1, "Please select a department"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

// --- Component ---

export const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab =
    searchParams.get("mode") === "signup" ? "register" : "login";

  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState<
    { id: string; name: string }[]
  >([]);
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedUniversity, setSelectedUniversity] = useState<string>("");
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Fetch universities on mount
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

  // Fetch departments when university changes
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

  // Login Form
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onLogin = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      await api.login(data.email, data.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Register Form
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    setValue: setRegisterValue,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onRegister = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      await api.registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        deptId: data.deptId,
        universityId: data.universityId,
      });

      toast.success("Account created! You can now log in.");
      // Optional: Auto-login or switch tab
      const tabTrigger = document.querySelector(
        '[data-value="login"]'
      ) as HTMLElement;
      if (tabTrigger) tabTrigger.click();
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-fade-in" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-rose-500/10 dark:bg-rose-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-fade-in delay-500" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-border/50 bg-card/60 backdrop-blur-xl shadow-xl animate-fade-in-up">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-muted rounded-xl border border-border/50">
              <BookOpen className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Adept AI
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your learning portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="student@university.edu"
                    {...loginRegister("email")}
                    className={loginErrors.email ? "border-destructive" : ""}
                  />
                  {loginErrors.email && (
                    <p className="text-xs text-destructive">
                      {loginErrors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...loginRegister("password")}
                    className={loginErrors.password ? "border-destructive" : ""}
                  />
                  {loginErrors.password && (
                    <p className="text-xs text-destructive">
                      {loginErrors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  className="w-full text-white bg-indigo-600 hover:bg-indigo-500"
                  type="submit"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form
                onSubmit={handleRegisterSubmit(onRegister)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <Input
                    id="reg-name"
                    placeholder="John Doe"
                    {...registerRegister("fullName")}
                    className={
                      registerErrors.fullName ? "border-destructive" : ""
                    }
                  />
                  {registerErrors.fullName && (
                    <p className="text-xs text-destructive">
                      {registerErrors.fullName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    placeholder="student@university.edu"
                    {...registerRegister("email")}
                    className={registerErrors.email ? "border-destructive" : ""}
                  />
                  {registerErrors.email && (
                    <p className="text-xs text-destructive">
                      {registerErrors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-university">University</Label>
                  <Select
                    onValueChange={(val) => {
                      setSelectedUniversity(val);
                      setRegisterValue("universityId", val);
                      // Reset department when university changes
                      setRegisterValue("deptId", "");
                    }}
                  >
                    <SelectTrigger
                      className={
                        registerErrors.universityId ? "border-destructive" : ""
                      }
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
                  {registerErrors.universityId && (
                    <p className="text-xs text-destructive">
                      {registerErrors.universityId.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-dept">Department</Label>
                  <Select
                    onValueChange={(val) => setRegisterValue("deptId", val)}
                    disabled={!selectedUniversity || loadingDepartments}
                  >
                    <SelectTrigger
                      className={
                        registerErrors.deptId ? "border-destructive" : ""
                      }
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
                  {registerErrors.deptId && (
                    <p className="text-xs text-destructive">
                      {registerErrors.deptId.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-pass">Password</Label>
                    <Input
                      id="reg-pass"
                      type="password"
                      {...registerRegister("password")}
                      className={
                        registerErrors.password ? "border-destructive" : ""
                      }
                    />
                    {registerErrors.password && (
                      <p className="text-xs text-destructive">
                        {registerErrors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm">Confirm</Label>
                    <Input
                      id="reg-confirm"
                      type="password"
                      {...registerRegister("confirmPassword")}
                      className={
                        registerErrors.confirmPassword
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {registerErrors.confirmPassword && (
                      <p className="text-xs text-destructive">
                        {registerErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  className="w-full text-white bg-indigo-600 hover:bg-indigo-500"
                  type="submit"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Floating Theme Toggle */}
      <FloatingThemeToggle />
    </div>
  );
};
