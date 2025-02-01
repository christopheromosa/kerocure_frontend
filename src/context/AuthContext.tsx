"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Define the shape of the authentication state
interface AuthState {
  token: string | null;
  role: string | null;
  username: string | null;
  user_id: number | null;
}

// Define the shape of the AuthContext
interface AuthContextType {
  authState: AuthState;
  login: (
    token: string,
    role: string,
    username: string,
    user_id: number
  ) => void;
  logout: () => void;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    role: null,
    username: null,
    user_id: null,
  });

  // Check localStorage for existing auth state on initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");
    const user_id = JSON.parse(localStorage.getItem("user_id") || "null");

    if (token && role && username && user_id) {
      setAuthState({ token, role, username, user_id });
    }
  }, []);

  // Login function
  const login = (
    token: string,
    role: string,
    username: string,
    user_id: number
  ) => {
    setAuthState({ token, role, username, user_id });
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("username", username);
    localStorage.setItem("user_id", JSON.stringify(user_id));
  };

  // Logout function
  const logout = () => {
    setAuthState({ token: null, role: null, username: null, user_id: null });
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
