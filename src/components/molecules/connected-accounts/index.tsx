"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/atoms/button";
import { useToast } from "@/components/atoms/toast/use-toast";
import { oauthService, ConnectedAccount } from "@/services/oauth";
import {
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";

interface ConnectedAccountsProps {
  onAccountsChange?: () => void;
}

const platformIcons = {
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
};

const platformNames = {
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
};

const platformColors = {
  twitter: "text-[#1DA1F2]",
  linkedin: "text-[#0077B5]",
  facebook: "text-[#4267B2]",
  instagram: "text-[#E1306C]",
};

export default function ConnectedAccounts({
  onAccountsChange,
}: ConnectedAccountsProps) {
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConnectedAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await oauthService.getConnectedAccounts();
      setConnectedAccounts(response.connectedAccounts);
      if (onAccountsChange) {
        onAccountsChange();
      }
    } catch (error: unknown) {
      console.error("Error fetching connected accounts:", error);
      toast({
        title: "Error Loading Accounts",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load connected accounts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [onAccountsChange, toast]);

  useEffect(() => {
    fetchConnectedAccounts();

    // Check for OAuth callback success/error
    const urlParams = new URLSearchParams(window.location.search);
    const oauthStatus = urlParams.get("oauth");
    const oauthPlatform = urlParams.get("platform");

    if (oauthStatus === "success" && oauthPlatform) {
      toast({
        title: "Account Connected! ✅",
        description: `Your ${oauthPlatform} account has been connected successfully.`,
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchConnectedAccounts();
    } else if (oauthStatus === "error" && oauthPlatform) {
      toast({
        title: "Connection Failed ❌",
        description: `Failed to connect your ${oauthPlatform} account. Please try again.`,
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [fetchConnectedAccounts, toast]);

  const handleConnect = async (platform: "twitter" | "linkedin" | "meta") => {
    try {
      setIsConnecting(platform);

      if (platform === "twitter") {
        await oauthService.connectTwitter();
      } else if (platform === "linkedin") {
        await oauthService.connectLinkedIn();
      } else if (platform === "meta") {
        await oauthService.connectMeta();
      }

      // User will be redirected to OAuth provider
    } catch (error: unknown) {
      console.error(`Error connecting ${platform}:`, error);
      toast({
        title: "Connection Failed",
        description:
          error instanceof Error
            ? error.message
            : `Failed to connect ${platform} account`,
        variant: "destructive",
      });
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (platform: ConnectedAccount["platform"]) => {
    if (
      !confirm(
        `Are you sure you want to disconnect your ${platformNames[platform]} account?`
      )
    ) {
      return;
    }

    try {
      await oauthService.disconnectAccount(platform);
      toast({
        title: "Account Disconnected",
        description: `Your ${platformNames[platform]} account has been disconnected.`,
      });
      fetchConnectedAccounts();
    } catch (error: unknown) {
      console.error(`Error disconnecting ${platform}:`, error);
      toast({
        title: "Disconnection Failed",
        description:
          error instanceof Error
            ? error.message
            : `Failed to disconnect ${platformNames[platform]} account`,
        variant: "destructive",
      });
    }
  };

  const isConnected = (platform: ConnectedAccount["platform"]) => {
    return connectedAccounts.some((acc) => acc.platform === platform);
  };

  const getAccount = (platform: ConnectedAccount["platform"]) => {
    return connectedAccounts.find((acc) => acc.platform === platform);
  };

  const platforms: Array<{
    key: ConnectedAccount["platform"];
    connectKey: "twitter" | "linkedin" | "meta";
  }> = [
    { key: "twitter", connectKey: "twitter" },
    { key: "linkedin", connectKey: "linkedin" },
    { key: "facebook", connectKey: "meta" },
    { key: "instagram", connectKey: "meta" },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            Loading your connected social media accounts...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3a8e9c]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>
          Connect your social media accounts to enable direct posting from
          EchoMe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {platforms.map(({ key, connectKey }) => {
            const Icon = platformIcons[key];
            const account = getAccount(key);
            const connected = isConnected(key);

            return (
              <div
                key={key}
                className="flex items-center justify-between p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-6 w-6 ${platformColors[key]}`} />
                  <div>
                    <h4 className="font-semibold text-zinc-900">
                      {platformNames[key]}
                    </h4>
                    {connected && account ? (
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>@{account.profileName}</span>
                        {account.isExpired && (
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-stone-500">Not connected</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {connected ? (
                    <>
                      {account?.isExpired && (
                        <Button
                          onClick={() => handleConnect(connectKey)}
                          disabled={isConnecting === connectKey}
                          variant="outline"
                          size="sm"
                          className="border-orange-500 text-orange-500 hover:bg-orange-50"
                        >
                          Reconnect
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDisconnect(key)}
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleConnect(connectKey)}
                      disabled={isConnecting === connectKey}
                      className="bg-[#3a8e9c] hover:bg-[#2d7a85]"
                      size="sm"
                    >
                      {isConnecting === connectKey
                        ? "Connecting..."
                        : "Connect"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {connectedAccounts.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              ✨ <strong>{connectedAccounts.length}</strong> account
              {connectedAccounts.length !== 1 ? "s" : ""} connected. You can now
              post directly to these platforms from your content kits!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
