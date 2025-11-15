import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Professional, Subscription } from "../lib/supabase";

type User = {
  id: string;
  email: string;
  role: 'professional' | 'admin';
  professional?: Professional;
  subscription?: Subscription;
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
  refreshSubscription: () => Promise<void>;
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

  const checkSubscriptionStatus = async (professionalId: string): Promise<Subscription | undefined> => {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscription) return undefined;

    const now = new Date();
    const trialEnds = new Date(subscription.trial_ends_at);
    const periodEnds = new Date(subscription.current_period_end);

    if (subscription.status === 'trial' && trialEnds < now) {
      await supabase
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('id', subscription.id);
      return { ...subscription, status: 'expired' };
    }

    if (subscription.status === 'active' && periodEnds < now) {
      await supabase
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('id', subscription.id);
      return { ...subscription, status: 'expired' };
    }

    return subscription;
  };

  const loadUserData = async (authUserId: string) => {
    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();

    if (adminData) {
      const { data: authUser } = await supabase.auth.getUser();
      setUser({
        id: authUserId,
        email: authUser.user?.email || adminData.email,
        role: 'admin',
      });
      return;
    }

    const { data: professional } = await supabase
      .from('professionals')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();

    if (professional) {
      const subscription = await checkSubscriptionStatus(professional.id);
      const { data: authUser } = await supabase.auth.getUser();

      setUser({
        id: authUserId,
        email: authUser.user?.email || professional.email,
        role: 'professional',
        professional,
        subscription,
      });
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          await loadUserData(session.user.id);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erro ao criar usuário');

      const { error: professionalError } = await supabase
        .from('professionals')
        .insert({
          auth_user_id: authData.user.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          city: data.city,
          state: data.state,
          specialty: data.specialty,
          registration_number: data.registration_number,
        });

      if (professionalError) throw professionalError;

      const { data: professional } = await supabase
        .from('professionals')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .single();

      if (!professional) throw new Error('Erro ao carregar dados do profissional');

      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 3);

      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          professional_id: professional.id,
          status: 'trial',
          trial_ends_at: trialEndsAt.toISOString(),
          current_period_start: new Date().toISOString(),
          current_period_end: trialEndsAt.toISOString(),
        });

      if (subscriptionError) throw subscriptionError;

      await loadUserData(authData.user.id);
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Erro ao fazer login');

      await loadUserData(data.user.id);

      const { data: adminCheck } = await supabase
        .from('admins')
        .select('id')
        .eq('auth_user_id', data.user.id)
        .maybeSingle();

      if (adminCheck) {
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
      await supabase.auth.signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscription = async () => {
    if (user?.professional) {
      const subscription = await checkSubscriptionStatus(user.professional.id);
      setUser({ ...user, subscription });
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
    refreshSubscription,
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
