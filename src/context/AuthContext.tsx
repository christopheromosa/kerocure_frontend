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
  first_name:string | null;
  last_name:string | null;
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
    first_name:string,
   last_name:string,
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
    first_name:null,
    last_name:null,
    user_id: null,
    is_active: true, // Default to true
  });

  // Check localStorage for existing auth state on initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const roles = JSON.parse(localStorage.getItem("roles") || "[]"); // Parse roles as an array
    const username = localStorage.getItem("username");
    const first_name = localStorage.getItem("first_name");
    const last_name = localStorage.getItem("last_name");
    const user_id = JSON.parse(localStorage.getItem("user_id") || "null");
    const is_active = JSON.parse(localStorage.getItem("is_active") || "true");

    if (token && roles.length > 0 && username && first_name && last_name &&  user_id) {
      setAuthState({ token, roles, username, user_id,first_name,last_name, is_active });
    }
  }, []);

  // Login function
  const login = (
    token: string,
    roles: string[],
    username: string,
    first_name:string,
    last_name:string,
    user_id: number,
    is_active: boolean
  ) => {
    setAuthState({ token, roles, username,first_name,last_name, user_id, is_active });
    localStorage.setItem("token", token);
    localStorage.setItem("roles", JSON.stringify(roles)); // Store roles as a JSON array
    localStorage.setItem("username", username);
    localStorage.setItem("first_name", first_name);
    localStorage.setItem("last_name", last_name);
    localStorage.setItem("user_id", JSON.stringify(user_id));
    localStorage.setItem("is_active", JSON.stringify(is_active));
  };

  // Logout function
  const logout = () => {
    setAuthState({
      token: null,
      roles: [],
      username: null,
      first_name:null,
      last_name:null,
      user_id: null,
      is_active: true,
    });
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    localStorage.removeItem("username");
    localStorage.removeItem("first_name");
    localStorage.removeItem("last_name");
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
