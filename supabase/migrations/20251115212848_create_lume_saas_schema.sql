/*
  # Criação do Schema LUME SaaS
  
  ## Descrição
  Sistema SaaS para profissionais da saúde com assinatura mensal.
  
  ## Novas Tabelas
  
  ### `professionals`
  - `id` (uuid, primary key) - ID único do profissional
  - `auth_user_id` (uuid, unique) - Referência ao auth.users do Supabase
  - `name` (text) - Nome completo
  - `email` (text, unique) - Email
  - `phone` (text) - Telefone
  - `city` (text) - Cidade
  - `state` (text) - Estado
  - `specialty` (text) - Especialidade
  - `registration_number` (text) - Número de registro profissional
  - `signature_url` (text) - URL da assinatura digital
  - `created_at` (timestamptz) - Data de criação
  - `updated_at` (timestamptz) - Data de atualização
  
  ### `subscriptions`
  - `id` (uuid, primary key) - ID único da assinatura
  - `professional_id` (uuid) - Referência ao profissional
  - `status` (text) - Status: 'trial', 'active', 'cancelled', 'expired'
  - `trial_ends_at` (timestamptz) - Data de término do trial (3 dias)
  - `current_period_start` (timestamptz) - Início do período atual
  - `current_period_end` (timestamptz) - Fim do período atual
  - `cancelled_at` (timestamptz, nullable) - Data de cancelamento
  - `created_at` (timestamptz) - Data de criação
  
  ### `patients`
  - `id` (uuid, primary key) - ID único do paciente
  - `professional_id` (uuid) - Profissional responsável
  - `name` (text) - Nome completo
  - `email` (text) - Email
  - `phone` (text) - Telefone
  - `birth_date` (date) - Data de nascimento
  - `cpf` (text) - CPF
  - `address` (text) - Endereço completo
  - `created_at` (timestamptz) - Data de criação
  
  ### `consultations`
  - `id` (uuid, primary key) - ID único da consulta
  - `professional_id` (uuid) - Profissional
  - `patient_id` (uuid) - Paciente
  - `date` (date) - Data da consulta
  - `time` (time) - Horário
  - `service_type` (text) - Tipo de serviço
  - `value` (decimal) - Valor
  - `status` (text) - Status: 'scheduled', 'completed', 'cancelled'
  - `notes` (text) - Observações
  - `cancellation_reason` (text) - Motivo do cancelamento
  - `created_at` (timestamptz) - Data de criação
  
  ### `medical_records`
  - `id` (uuid, primary key) - ID único do prontuário
  - `consultation_id` (uuid) - Referência à consulta
  - `professional_id` (uuid) - Profissional
  - `patient_id` (uuid) - Paciente
  - `diagnosis` (text) - Diagnóstico
  - `treatment` (text) - Tratamento
  - `prescriptions` (text) - Prescrições
  - `observations` (text) - Observações
  - `created_at` (timestamptz) - Data de criação
  
  ### `documents`
  - `id` (uuid, primary key) - ID único do documento
  - `professional_id` (uuid) - Profissional
  - `patient_id` (uuid) - Paciente
  - `type` (text) - Tipo de documento
  - `content` (jsonb) - Conteúdo do documento
  - `pdf_url` (text) - URL do PDF gerado
  - `created_at` (timestamptz) - Data de criação
  
  ### `availability_slots`
  - `id` (uuid, primary key) - ID único do slot
  - `professional_id` (uuid) - Profissional
  - `day_of_week` (integer) - Dia da semana (0-6)
  - `start_time` (time) - Horário inicial
  - `end_time` (time) - Horário final
  - `is_active` (boolean) - Se está ativo
  
  ### `admins`
  - `id` (uuid, primary key) - ID único do admin
  - `auth_user_id` (uuid, unique) - Referência ao auth.users
  - `name` (text) - Nome
  - `email` (text, unique) - Email
  - `created_at` (timestamptz) - Data de criação
  
  ## Segurança
  - RLS habilitado em todas as tabelas
  - Policies restritivas para cada tipo de usuário
  - Profissionais só acessam seus próprios dados
  - Admin tem acesso somente a dados não financeiros dos profissionais
*/

-- Criar tabela de profissionais
CREATE TABLE IF NOT EXISTS professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  specialty text NOT NULL,
  registration_number text NOT NULL,
  signature_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'trial',
  trial_ends_at timestamptz NOT NULL,
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('trial', 'active', 'cancelled', 'expired'))
);

-- Criar tabela de pacientes
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  birth_date date NOT NULL,
  cpf text NOT NULL,
  address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de consultas
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE NOT NULL,
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  service_type text NOT NULL,
  value decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  cancellation_reason text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'completed', 'cancelled'))
);

-- Criar tabela de prontuários
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid REFERENCES consultations(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE NOT NULL,
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  diagnosis text,
  treatment text,
  prescriptions text,
  observations text,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de documentos
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE NOT NULL,
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  content jsonb NOT NULL,
  pdf_url text,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de slots de disponibilidade
CREATE TABLE IF NOT EXISTS availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true
);

-- Criar tabela de admins
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policies para professionals
CREATE POLICY "Profissionais podem ver próprio perfil"
  ON professionals FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Profissionais podem atualizar próprio perfil"
  ON professionals FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Admins podem ver todos os profissionais"
  ON professionals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Policies para subscriptions
CREATE POLICY "Profissionais podem ver própria assinatura"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = subscriptions.professional_id
      AND professionals.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins podem ver todas as assinaturas"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Policies para patients
CREATE POLICY "Profissionais podem ver próprios pacientes"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = patients.professional_id
      AND professionals.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Profissionais podem inserir pacientes"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = patients.professional_id
      AND professionals.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Profissionais podem atualizar próprios pacientes"
  ON patients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = patients.professional_id
      AND professionals.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = patients.professional_id
      AND professionals.auth_user_id = auth.uid()
    )
  );

-- Policies para consultations
CREATE POLICY "Profissionais podem ver próprias consultas"
  ON consultations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = consultations.professional_id
      AND professionals.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Profissionais podem inserir consultas"
  ON consultations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = consultations.professional_id
      AND professionals.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Profissionais podem atualizar próprias consultas"
  ON consultations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = consultations.professional_id
      AND professionals.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = consultations.professional_id
      AND professionals.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Profissionais podem deletar próprias consultas"
  ON consultations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = consultations.professional_id
      AND professionals.auth_user_id = auth.uid()
    )
  );

-- Policies para medical_records
CREATE POLICY "Profissionais podem ver próprios prontuários"
  ON medical_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = medical_records.professional_id
      AND professionals.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Profissionais podem inserir prontuários"
  ON medical_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = medical_records.professional_id
      AND professionals.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Profissionais podem atualizar próprios prontuários"
  ON medical_records FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = medical_records.professional_id
      AND professionals.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = medical_records.professional_id
      AND professionals.auth_user_id = auth.uid()
    )
  );

-- Policies para documents
CREATE POLICY "Profissionais podem ver próprios documentos"
  ON documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = documents.professional_id
      AND professionals.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Profissionais podem inserir documentos"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = documents.professional_id
      AND professionals.auth_user_id = auth.uid()
    )
  );

-- Policies para availability_slots
CREATE POLICY "Profissionais podem gerenciar próprios slots"
  ON availability_slots FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = availability_slots.professional_id
      AND professionals.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = availability_slots.professional_id
      AND professionals.auth_user_id = auth.uid()
    )
  );

-- Policies para admins
CREATE POLICY "Admins podem ver próprio perfil"
  ON admins FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_professionals_auth_user_id ON professionals(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_professional_id ON subscriptions(professional_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_patients_professional_id ON patients(professional_id);
CREATE INDEX IF NOT EXISTS idx_consultations_professional_id ON consultations(professional_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(date);
CREATE INDEX IF NOT EXISTS idx_medical_records_professional_id ON medical_records(professional_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_documents_professional_id ON documents(professional_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_professional_id ON availability_slots(professional_id);