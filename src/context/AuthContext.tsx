"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import LoadingPage from "@/components/loading_animation";

interface AuthState {
  token: string | null;
  roles: string;
  currentRole: string | null; // New currentRole field
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  user_id: number | null;
  is_active: boolean;
}

interface AuthContextType {
  authState: AuthState;
  login: (
    token: string,
    roles: string,
    username: string,
    first_name: string,
    last_name: string,
    user_id: number,
    is_active: boolean
  ) => void;
  logout: () => void;
  setCurrentRole: (role: string) => void; // New setter
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    roles: "",
    currentRole: null, // Starts as null
    username: null,
    first_name: null,
    last_name: null,
    user_id: null,
    is_active: true,
  });

  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const roles = JSON.parse(localStorage.getItem("roles") || "[]");
    const currentRole = localStorage.getItem("currentRole");
    const username = localStorage.getItem("username");
    const first_name = localStorage.getItem("first_name");
    const last_name = localStorage.getItem("last_name");
    const user_id = JSON.parse(localStorage.getItem("user_id") || "null");
    const is_active = JSON.parse(localStorage.getItem("is_active") || "true");

    setAuthState({
      token,
      roles,
      currentRole,
      username,
      first_name,
      last_name,
      user_id,
      is_active,
    });
    setLoading(false);
  }, []);

  const login = (
    token: string,
    roles: string,
    username: string,
    first_name: string,
    last_name: string,
    user_id: number,
    is_active: boolean
  ) => {
    // Don't set currentRole here - it will be set in the role selection dialog
    const newState = {
      token,
      roles,
      currentRole: null, // Starts as null
      username,
      first_name,
      last_name,
      user_id,
      is_active,
    };

    setAuthState(newState);
    localStorage.setItem("token", token);
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("username", username);
    localStorage.setItem("first_name", first_name);
    localStorage.setItem("last_name", last_name);
    localStorage.setItem("user_id", JSON.stringify(user_id));
    localStorage.setItem("is_active", JSON.stringify(is_active));
  };

  const setCurrentRole = (role: string) => {
    setAuthState((prev) => ({ ...prev, currentRole: role }));
    localStorage.setItem("currentRole", role);
  };

  const logout = () => {
    setAuthState({
      token: null,
      roles: "",
      currentRole: null,
      username: null,
      first_name: null,
      last_name: null,
      user_id: null,
      is_active: true,
    });
    localStorage.clear();
  };

  if (loading) return <LoadingPage />;

  return (
    <AuthContext.Provider value={{ authState, login, logout, setCurrentRole }}>
      {children}
    </AuthContext.Provider>
  );
};
