"use client";

import * as React from "react";
import { useUsers } from "@/hooks/api/use-users";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { User, Save, Loader2, Upload, Check } from "lucide-react";
import { userService } from "@/services/user";

interface UserProfileFormProps {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export function UserProfileForm({ onSuccess, onError }: UserProfileFormProps) {
  const { user } = useAuthStore();
  const { updateCurrentUser, getCurrentUser, isLoading, error } = useUsers();

  const [formData, setFormData] = React.useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    username: user?.username || "",
  });

  const [avatarUrl, setAvatarUrl] = React.useState(
    user?.media?.images?.avatar || ""
  );
  const [avatarKey, setAvatarKey] = React.useState(user?.profilePicture || "");
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);

  // Fetch fresh user data on mount to get valid presigned URLs
  React.useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
      });
      setAvatarUrl(user.media?.images?.avatar || "");
      setAvatarKey(user.profilePicture || "");
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarUrl(e.target.value);
    setAvatarKey(e.target.value);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      onError?.("Please select a valid image file (JPEG, PNG, WebP, or GIF)");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      onError?.("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);
    try {
      const uploadResult = await userService.uploadProfilePicture(file);
      const previewUrl = uploadResult.profilePictureUrl || uploadResult.s3Url;
      setAvatarUrl(previewUrl);
      setAvatarKey(uploadResult.key);
      setUploadSuccess(true);
      onSuccess?.(
        "✓ Profile picture uploaded! Click 'Save Changes' to confirm."
      );

      // Reset success state after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to upload profile picture";
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const profilePictureValue =
        avatarKey || (avatarUrl ? avatarUrl.trim() : "");
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        profilePicture: profilePictureValue || null,
      };

      const result = await updateCurrentUser(updateData);

      if (result.success) {
        if (result.data) {
          setAvatarUrl(result.data.media?.images?.avatar || "");
          setAvatarKey(result.data.profilePicture || "");
        }
        onSuccess?.(result.message || "Profile updated successfully");
      } else {
        onError?.(result.error || "Failed to update profile");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      onError?.(errorMessage);
    }
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Profile
        </CardTitle>
        <CardDescription>
          Update your personal information and profile settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} alt="Profile avatar" />
              <AvatarFallback className="text-2xl font-semibold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-center space-y-2">
              <input
                type="file"
                id="profile-picture"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <Button
                type="button"
                variant={uploadSuccess ? "default" : "outline"}
                disabled={isUploading}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  uploadSuccess
                    ? "bg-green-600 hover:bg-green-700"
                    : "hover:bg-gray-100 hover:border-gray-400"
                }`}
                onClick={() =>
                  document.getElementById("profile-picture")?.click()
                }
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : uploadSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    Uploaded!
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </>
                )}
              </Button>
              {uploadSuccess && (
                <p className="text-sm text-green-600 font-medium animate-pulse">
                  Remember to click &quot;Save Changes&quot; below!
                </p>
              )}
            </div>

            <div className="w-full max-w-xs">
              <Label htmlFor="avatar">Or enter avatar URL</Label>
              <Input
                id="avatar"
                name="avatar"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={handleAvatarChange}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleInputChange}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleInputChange}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ""}
              disabled
              className="mt-1 bg-gray-50"
            />
            <p className="text-sm text-gray-500 mt-1">
              Email cannot be changed. Contact support if you need to update
              your email.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
