import { create } from "zustand";

interface User {
  id?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  primaryWallet?: string;
  wallets?: string[];
  portfolioId?: string;
  media?: {
    images?: {
      avatar?: string;
    };
  };
  profilePicture?: string;
  profilePictureUrl?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: string | null;
  initializeAuth: () => void;
  login: (user: User, session?: string) => void;
  logout: () => void;
  setSession: (session: string) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  syncAuthState: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUserProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  session: null,
  initializeAuth: () => {
    set({ isLoading: true });
    localStorage.removeItem("auth-storage");
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");

    if (accessToken && userId) {
      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        const tokenExp = payload.exp;
        const isExpired = tokenExp < currentTime - 300;

        if (!isExpired) {
          set({
            isAuthenticated: true,
            isLoading: false,
            user: { id: userId },
          });
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("idToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userId");
          set({
            isAuthenticated: false,
            isLoading: false,
            user: null,
          });
        }
      } catch (error) {
        console.error("initializeAuth - error parsing token:", error);
        console.error(
          "initializeAuth - token that failed to parse:",
          accessToken.substring(0, 50) + "..."
        );
        localStorage.removeItem("accessToken");
        localStorage.removeItem("idToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        set({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    } else {
      set({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    }
  },
  login: (user: User, session?: string) => {
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
      session: session || get().session,
    });
  },
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("idToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      session: null,
    });
  },
  setSession: (session: string) => {
    set({ session });
  },
  clearSession: () => {
    set({ session: null });
  },
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  syncAuthState: () => {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");

    if (accessToken && userId) {
      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp < currentTime - 300;

        if (!isExpired) {
          set({
            isAuthenticated: true,
            user: { id: userId },
          });
        } else {
          set({
            isAuthenticated: false,
            user: null,
          });
        }
      } catch (error) {
        console.error("syncAuthState - error parsing token:", error);
        set({
          isAuthenticated: false,
          user: null,
        });
      }
    } else {
      set({
        isAuthenticated: false,
        user: null,
      });
    }
  },
  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, ...userData },
      });
    }
  },
  refreshUserProfile: async () => {
    try {
      // Placeholder: refresh logic will be implemented once the endpoint is available.
      return;
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
    }
  },
}));
