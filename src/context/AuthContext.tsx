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
  roles: string[]; // Changed to an array of roles
  username: string | null;
  user_id: number | null;
  is_active: boolean; // Added is_active status
}

// Define the shape of the AuthContext
interface AuthContextType {
  authState: AuthState;
  login: (
    token: string,
    roles: string[],
    username: string,
    user_id: number,
    is_active: boolean
  ) => void;
  logout: () => void;
  selectRole: (role: string) => void; // Function to select a role
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
    roles: [], // Initialize roles as an empty array
    username: null,
    user_id: null,
    is_active: true, // Default to true
  });

  // Check localStorage for existing auth state on initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const roles = JSON.parse(localStorage.getItem("roles") || "[]"); // Parse roles as an array
    const username = localStorage.getItem("username");
    const user_id = JSON.parse(localStorage.getItem("user_id") || "null");
    const is_active = JSON.parse(localStorage.getItem("is_active") || "true");

    if (token && roles.length > 0 && username && user_id) {
      setAuthState({ token, roles, username, user_id, is_active });
    }
  }, []);

  // Login function
  const login = (
    token: string,
    roles: string[],
    username: string,
    user_id: number,
    is_active: boolean
  ) => {
    setAuthState({ token, roles, username, user_id, is_active });
    localStorage.setItem("token", token);
    localStorage.setItem("roles", JSON.stringify(roles)); // Store roles as a JSON array
    localStorage.setItem("username", username);
    localStorage.setItem("user_id", JSON.stringify(user_id));
    localStorage.setItem("is_active", JSON.stringify(is_active));
  };

  // Logout function
  const logout = () => {
    setAuthState({
      token: null,
      roles: [],
      username: null,
      user_id: null,
      is_active: true,
    });
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    localStorage.removeItem("is_active");
  };

  // Function to select a role
  const selectRole = (role: string) => {
    setAuthState((prevState) => ({
      ...prevState,
      roles: [role], // Set the selected role as the only role
    }));
    localStorage.setItem("roles", JSON.stringify([role])); // Update localStorage
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, selectRole }}>
      {children}
    </AuthContext.Provider>
  );
};
