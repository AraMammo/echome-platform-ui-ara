export interface Tokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  userId: string;
}

export interface PartialTokens {
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
  userId?: string;
}

export const TokenManager = {
  setTokens: (tokens: Tokens) => {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("idToken", tokens.idToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    localStorage.setItem("userId", tokens.userId);
  },

  getTokens: (): PartialTokens => {
    return {
      accessToken: localStorage.getItem("accessToken") || undefined,
      idToken: localStorage.getItem("idToken") || undefined,
      refreshToken: localStorage.getItem("refreshToken") || undefined,
      userId: localStorage.getItem("userId") || undefined,
    };
  },

  getToken: (key: keyof Tokens): string | null => {
    return localStorage.getItem(key);
  },

  isAuthenticated: (): boolean => {
    const accessToken = localStorage.getItem("accessToken");
    return !!accessToken;
  },

  clearTokens: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("idToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
  },

  areTokensExpired: (): boolean => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return true;

    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true;
    }
  },
};
