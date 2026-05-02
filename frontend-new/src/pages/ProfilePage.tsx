import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useAppData } from "@/contexts/app-data-context";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Loader2, Save, Trash2, User } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, type Variants } from "framer-motion";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  deptId: z.string().min(1, "Please select a department"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

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

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile, logout } = useAuth();
  const { departments, university, initialLoading } = useAppData();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const userEmail = user?.email || "";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: profile?.full_name || "",
      deptId: profile?.dept_id || "",
    },
  });

  const selectedDeptId = watch("deptId");

  const onSubmit = async (data: ProfileFormData) => {
    if (!profile) return;

    setSaving(true);
    try {
      await api.updateProfile(profile.user_id, {
        fullName: data.fullName,
        deptId: data.deptId,
      });

      await refreshProfile();
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.charAt(0).toUpperCase() || "U";
  };

  const getDepartmentName = (deptId: string) => {
    return departments.find((d) => d.id === deptId)?.name || "Unknown";
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.deleteAccount();
      await logout();
      toast.success("Account deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account");
      setDeleting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-32 h-1 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-secondary w-1/2 animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="max-w-3xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.header variants={itemVariants} className="space-y-2 mb-8">
        <h1 className="display-lg text-2xl sm:text-3xl">Profile Settings</h1>
        <p className="text-muted-foreground text-base">Manage your personal information and preferences.</p>
      </motion.header>

      {/* Profile Header Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-surface-container-highest/30 border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Avatar className="size-24 border border-white/10 shadow-[0_0_20px_rgba(96,99,238,0.15)]">
                <AvatarFallback className="gradient-bg text-2xl font-bold">
                  {getInitials(profile?.full_name, userEmail)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight">
                  {profile?.full_name || "User"}
                </h1>
                <p className="text-primary-dim mt-1">{userEmail}</p>
                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-highest border border-white/5">
                    {getDepartmentName(profile?.dept_id || "")}
                  </span>
                  {university && (
                    <span className="px-2.5 py-1 rounded-full bg-surface-container-highest border border-white/5">
                      {university.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Profile Form */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-surface-container-highest border border-white/5">
                <User className="size-5 text-primary" />
              </div>
              Edit Profile
            </CardTitle>
            <CardDescription>
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="label-sm">Email</Label>
                  <Input
                    id="email"
                    value={userEmail}
                    disabled
                    className="bg-surface-container-highest/30 text-muted-foreground opacity-70"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university" className="label-sm">University</Label>
                  <Input
                    id="university"
                    value={university?.name || ""}
                    disabled
                    className="bg-surface-container-highest/30 text-muted-foreground opacity-70"
                  />
                  <p className="text-xs text-muted-foreground">
                    University cannot be changed
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="label-sm">Full Name</Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="Enter your full name"
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deptId" className="label-sm">Department</Label>
                <Select
                  value={selectedDeptId}
                  onValueChange={(value) =>
                    setValue("deptId", value, { shouldDirty: true })
                  }
                >
                  <SelectTrigger
                    className={errors.deptId ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select your department" />
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

              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  disabled={saving || !isDirty}
                  className="h-12 px-8"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="size-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={itemVariants}>
        <Card className="border-destructive/20 bg-destructive/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent pointer-events-none" />
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-destructive text-xl">
              <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                <Trash2 className="size-5" />
              </div>
              Danger Zone
            </CardTitle>
            <CardDescription className="text-destructive/70">
              Permanently delete your account and all associated data. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={deleting}
                  className="h-12 px-6"
                >
                  {deleting ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="size-4 mr-2" />
                  )}
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-surface-container-highest border border-white/5">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account, profile, library,
                    and all chat history. This action{" "}
                    <span className="font-semibold text-destructive">
                      cannot be undone
                    </span>
                    .
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-surface-container-low border-white/5 hover:bg-surface-container-highest hover:text-foreground">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}