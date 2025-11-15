import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type User = {
  id: number;
  email: string;
  name: string;
  role: 'professional' | 'admin';
  subscription?: {
    status: 'trial' | 'active' | 'expired' | 'cancelled';
    trial_ends_at?: string;
    current_period_end?: string;
  };
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasActiveSubscription: boolean;
  isTrialActive: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  state: string;
  specialty: string;
  registration_number: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getApiUrl = () => {
    if (
      window.location.hostname === "cartaoquiroferreira.com.br" ||
      window.location.hostname === "www.cartaoquiroferreira.com.br"
    ) {
      return "https://www.cartaoquiroferreira.com.br";
    }
    return "http://localhost:3001";
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar conta");
      }

      const responseData = await response.json();

      localStorage.setItem("token", responseData.token);
      localStorage.setItem("user", JSON.stringify(responseData.user));

      setUser(responseData.user);
      navigate('/professional');
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao fazer login");
      }

      const data = await response.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);

      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/professional');
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      const apiUrl = getApiUrl();
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setUser(null);
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasActiveSubscription =
    user?.role === 'admin' ||
    (user?.subscription?.status === 'trial' || user?.subscription?.status === 'active');

  const isTrialActive = user?.subscription?.status === 'trial';

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    hasActiveSubscription,
    isTrialActive,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
