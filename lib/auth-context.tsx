"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User, Profile, Role } from "./api";
import { setAuthToken, getAuthToken, verifyToken, getUserRoles } from "./api";

// Known staff role IDs
export const ROLE_IDS = {
  OWNER: "{863B2C87-8B3C-4210-BB92-63434E3A662D}",
  FORUM_DIRECTOR: "{1453942A-8528-47DD-AA62-64F35CD74A3E}",
  MANAGEMENT_TEAM: "{BB77BE32-4D43-4473-801C-8C2E0B23B87C}",
  DEVELOPER: "{309191B6-9BF7-4921-80B9-65495BC1C468}",
  FORUM_MODERATOR: "{FDEB3F7A-19CD-405F-AE13-66D0FC9E1D15}",
  ASSISTANT: "{87A7A584-D1F6-4E49-AC89-5E49322C22F7}",
} as const;

// Role hierarchy for permission checks (higher = more permissions)
export const ROLE_HIERARCHY: Record<string, number> = {
  [ROLE_IDS.OWNER]: 100,
  [ROLE_IDS.FORUM_DIRECTOR]: 90,
  [ROLE_IDS.MANAGEMENT_TEAM]: 80,
  [ROLE_IDS.DEVELOPER]: 70,
  [ROLE_IDS.FORUM_MODERATOR]: 60,
  [ROLE_IDS.ASSISTANT]: 50,
};

interface AuthState {
  user: User | null;
  profile: Profile | null;
  roles: Role[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User, profile: Profile, roles: Role[]) => void;
  logout: () => void;
  updateProfile: (profile: Profile) => void;
  hasRole: (roleId: string) => boolean;
  hasAnyRole: () => boolean;
  getHighestRole: () => Role | null;
  canAccessPanel: () => boolean;
  hasPermissionLevel: (minLevel: number) => boolean;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    roles: [],
    isLoading: true,
    isAuthenticated: false,
  });

  // Verify token and load user on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      verifyToken()
        .then(({ user, profile, roles }) => {
          setState({
            user,
            profile,
            roles,
            isLoading: false,
            isAuthenticated: true,
          });
        })
        .catch(() => {
          // Token invalid, clear it
          setAuthToken(null);
          setState((prev) => ({ ...prev, isLoading: false }));
        });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback((token: string, user: User, profile: Profile, roles: Role[]) => {
    setAuthToken(token);
    setState({
      user,
      profile,
      roles,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setState({
      user: null,
      profile: null,
      roles: [],
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const updateProfile = useCallback((profile: Profile) => {
    setState((prev) => ({ ...prev, profile }));
  }, []);

  const hasRole = useCallback((roleId: string) => {
    return state.roles.some((r) => r.id === roleId);
  }, [state.roles]);

  const hasAnyRole = useCallback(() => {
    return state.roles.length > 0;
  }, [state.roles]);

  const getHighestRole = useCallback(() => {
    if (state.roles.length === 0) return null;
    return state.roles.reduce((highest, current) => {
      const currentLevel = ROLE_HIERARCHY[current.id] || 0;
      const highestLevel = ROLE_HIERARCHY[highest.id] || 0;
      return currentLevel > highestLevel ? current : highest;
    }, state.roles[0]);
  }, [state.roles]);

  const canAccessPanel = useCallback(() => {
    return state.roles.length > 0;
  }, [state.roles]);

  const hasPermissionLevel = useCallback((minLevel: number) => {
    return state.roles.some((r) => (ROLE_HIERARCHY[r.id] || 0) >= minLevel);
  }, [state.roles]);

  const refreshRoles = useCallback(async () => {
    if (!state.user) return;
    try {
      const roles = await getUserRoles(state.user.id);
      setState((prev) => ({ ...prev, roles: roles as Role[] }));
    } catch {
      // Ignore errors
    }
  }, [state.user]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateProfile,
        hasRole,
        hasAnyRole,
        getHighestRole,
        canAccessPanel,
        hasPermissionLevel,
        refreshRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper function to get role color
export function getRoleColor(roleId: string): string {
  switch (roleId) {
    case ROLE_IDS.OWNER:
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case ROLE_IDS.FORUM_DIRECTOR:
      return "bg-rose-500/20 text-rose-400 border-rose-500/30";
    case ROLE_IDS.MANAGEMENT_TEAM:
      return "bg-violet-500/20 text-violet-400 border-violet-500/30";
    case ROLE_IDS.DEVELOPER:
      return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    case ROLE_IDS.FORUM_MODERATOR:
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case ROLE_IDS.ASSISTANT:
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

// Get role icon name (for lucide icons)
export function getRoleIcon(roleId: string): string {
  switch (roleId) {
    case ROLE_IDS.OWNER:
      return "Crown";
    case ROLE_IDS.FORUM_DIRECTOR:
      return "Star";
    case ROLE_IDS.MANAGEMENT_TEAM:
      return "Users";
    case ROLE_IDS.DEVELOPER:
      return "Code";
    case ROLE_IDS.FORUM_MODERATOR:
      return "Shield";
    case ROLE_IDS.ASSISTANT:
      return "HelpCircle";
    default:
      return "User";
  }
}
