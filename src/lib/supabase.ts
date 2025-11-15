import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Professional = {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  specialty: string;
  registration_number: string;
  signature_url?: string;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  professional_id: string;
  status: 'trial' | 'active' | 'cancelled' | 'expired';
  trial_ends_at: string;
  current_period_start: string;
  current_period_end: string;
  cancelled_at?: string;
  created_at: string;
};

export type Patient = {
  id: string;
  professional_id: string;
  name: string;
  email?: string;
  phone: string;
  birth_date: string;
  cpf: string;
  address: string;
  created_at: string;
};

export type Consultation = {
  id: string;
  professional_id: string;
  patient_id: string;
  date: string;
  time: string;
  service_type: string;
  value: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  cancellation_reason?: string;
  created_at: string;
};
