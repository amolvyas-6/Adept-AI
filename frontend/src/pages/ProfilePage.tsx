import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Save, User } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  deptId: z.string().min(1, "Please select a department"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface Department {
  id: string;
  name: string;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const selectedDeptId = watch("deptId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await api.getSession();
        if (!session) return;

        setUserEmail(session.user.email || "");

        const [profileData, deptData] = await Promise.all([
          api.getProfile(session.user.id),
          api.getDepartments(),
        ]);

        setProfile(profileData);
        setDepartments(deptData);

        // Set form values
        setValue("fullName", profileData.full_name || "");
        setValue("deptId", profileData.dept_id || "");
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!profile) return;

    setSaving(true);
    try {
      const updated = await api.updateProfile(profile.user_id, {
        fullName: data.fullName,
        deptId: data.deptId,
      });

      setProfile(updated);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in-up">
      {/* Profile Header Card */}
      <Card className="backdrop-blur-xl bg-card/60 border-border/50 mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="size-20 border-2 border-indigo-500/20">
              <AvatarFallback className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-2xl">
                {getInitials(profile?.full_name, userEmail)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {profile?.full_name || "User"}
              </h1>
              <p className="text-muted-foreground">{userEmail}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {getDepartmentName(profile?.dept_id || "")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card className="backdrop-blur-xl bg-card/60 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Edit Profile
          </CardTitle>
          <CardDescription>
            Update your personal information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={userEmail}
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
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
              <Label htmlFor="deptId">Department</Label>
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

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={saving || !isDirty}
                className="bg-indigo-600 hover:bg-indigo-700"
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
    </div>
  );
}
