import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Lock, Save } from "lucide-react";
import { toast } from "sonner";
import type { User as UserType } from "@/types";

const ProfilePage = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<UserType>({
    queryKey: ["profile"],
    queryFn: authService.getProfile,
  });

  const [profileForm, setProfileForm] = useState({
    username: "",
    age: "",
    height: "",
    weight: "",
    goal: "",
    fitnessLevel: "",
    budgetLevel: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // استخدام useEffect هنا أفضل بكثير من وضع شرط داخل الـ render مباشرة
  useEffect(() => {
    // نتحقق من وجود الـ user والـ user.data لأن الـ API يغلف البيانات بداخل data
    if (user && user.data) {
      const userData = user.data; // لتسهيل الوصول

      setProfileForm({
        username: userData.username || "",
        age: String(userData.profile?.age || ""),
        height: String(userData.profile?.height || ""),
        weight: String(userData.profile?.weight || ""),
        goal: userData.profile?.goal || "",
        fitnessLevel: userData.profile?.fitnessLevel || "",
        budgetLevel: userData.profile?.budgetLevel || "",
      });
    }
  }, [user]);

  const profileMutation = useMutation({
    mutationFn: () => {
      // ✅ أضف كلمة return هنا ضروري جداً
      return authService.updateProfile({
        username: profileForm.username || undefined,
        age: profileForm.age ? Number(profileForm.age) : undefined,
        height: profileForm.height ? Number(profileForm.height) : undefined,
        weight: profileForm.weight ? Number(profileForm.weight) : undefined,
        goal: profileForm.goal || undefined,
        fitnessLevel: profileForm.fitnessLevel || undefined,
        budgetLevel: profileForm.budgetLevel || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error: any) => {
      // قراءة رسالة الخطأ القادمة من الـ Backend (AppError) وعرضها لليوزر
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () =>
      authService.updatePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
      ),
    onSuccess: () => {
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password updated successfully!");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update password";
      toast.error(errorMessage);
    },
  });

  const canSavePassword =
    passwordForm.currentPassword &&
    passwordForm.newPassword.length >= 6 &&
    passwordForm.newPassword === passwordForm.confirmPassword;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto space-y-8"
      >
        <h1 className="font-display text-2xl font-bold text-foreground">
          Profile Settings
        </h1>

        {/* Profile Info */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-medium mb-4">
            <User className="w-4 h-4" /> Personal Info
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground text-xs">Email</Label>
              <Input
                value={user?.email || ""}
                disabled
                className="bg-muted/30 border-border mt-1"
              />
            </div>

            <div>
              <Label className="text-muted-foreground text-xs">Username</Label>
              <Input
                value={profileForm.username}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, username: e.target.value }))
                }
                className="bg-muted/50 border-border mt-1"
              />
            </div>

            {/* الأرقام: العمر، الطول، الوزن */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-muted-foreground text-xs">Age</Label>
                <Input
                  type="number"
                  value={profileForm.age}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, age: e.target.value }))
                  }
                  className="bg-muted/50 border-border mt-1"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">
                  Height (cm)
                </Label>
                <Input
                  type="number"
                  value={profileForm.height}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, height: e.target.value }))
                  }
                  className="bg-muted/50 border-border mt-1"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">
                  Weight (kg)
                </Label>
                <Input
                  type="number"
                  value={profileForm.weight}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, weight: e.target.value }))
                  }
                  className="bg-muted/50 border-border mt-1"
                />
              </div>
            </div>

            {/* الخيارات الجديدة (Enums) باستخدام Shadcn Select */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <Label className="text-muted-foreground text-xs">Goal</Label>
                <Select
                  value={profileForm.goal}
                  onValueChange={(val) =>
                    setProfileForm((p) => ({ ...p, goal: val }))
                  }
                >
                  <SelectTrigger className="bg-muted/50 border-border mt-1">
                    <SelectValue placeholder="Select Goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Losing Weight">Losing Weight</SelectItem>
                    <SelectItem value="Building Muscle">
                      Building Muscle
                    </SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">
                  Fitness Level
                </Label>
                <Select
                  value={profileForm.fitnessLevel}
                  onValueChange={(val) =>
                    setProfileForm((p) => ({ ...p, fitnessLevel: val }))
                  }
                >
                  <SelectTrigger className="bg-muted/50 border-border mt-1">
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label className="text-muted-foreground text-xs">
                  Budget Level
                </Label>
                <Select
                  value={profileForm.budgetLevel}
                  onValueChange={(val) =>
                    setProfileForm((p) => ({ ...p, budgetLevel: val }))
                  }
                >
                  <SelectTrigger className="bg-muted/50 border-border mt-1">
                    <SelectValue placeholder="Select Budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Economic">Economic</SelectItem>
                    <SelectItem value="Average">Average</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button
            variant="electric"
            onClick={() => profileMutation.mutate()}
            disabled={profileMutation.isPending}
            className="w-full mt-6"
          >
            <Save className="w-4 h-4 mr-1" />{" "}
            {profileMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <Separator className="bg-border" />

        {/* Change Password */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-medium mb-4">
            <Lock className="w-4 h-4" /> Change Password
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-muted-foreground text-xs">
                Current Password
              </Label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({
                    ...p,
                    currentPassword: e.target.value,
                  }))
                }
                className="bg-muted/50 border-border mt-1"
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">
                New Password
              </Label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({
                    ...p,
                    newPassword: e.target.value,
                  }))
                }
                className="bg-muted/50 border-border mt-1"
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">
                Confirm New Password
              </Label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({
                    ...p,
                    confirmPassword: e.target.value,
                  }))
                }
                className="bg-muted/50 border-border mt-1"
              />
            </div>
          </div>

          <Button
            variant="electric"
            onClick={() => passwordMutation.mutate()}
            disabled={!canSavePassword || passwordMutation.isPending}
            className="w-full mt-6"
          >
            <Lock className="w-4 h-4 mr-1" />{" "}
            {passwordMutation.isPending ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ProfilePage;
