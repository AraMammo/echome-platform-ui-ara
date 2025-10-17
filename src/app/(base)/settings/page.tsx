"use client";

import { UserProfileForm } from "@/components/molecules/user-profile-form";
import ConnectedAccounts from "@/components/molecules/connected-accounts";
import { useUsers } from "@/hooks/api/use-users";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/components/atoms/toast";
import { useEffect } from "react";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { getCurrentUser } = useUsers();
  const { success, error } = useToast();

  useEffect(() => {
    if (user?.id && (!user?.firstName || !user?.lastName)) {
      getCurrentUser();
    }
  }, [user, getCurrentUser]);

  const handleSuccess = (message: string) => {
    success(message);
  };

  const handleError = (errorMessage: string) => {
    error(errorMessage);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-8">
        <UserProfileForm onSuccess={handleSuccess} onError={handleError} />
        <ConnectedAccounts />
      </div>
    </div>
  );
}
