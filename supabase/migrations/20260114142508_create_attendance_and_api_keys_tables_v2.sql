/*
  # Crear tablas de asistencia y API keys
  
  1. Nuevas Tablas
    - `attendance_records` - Registros de asistencia (marcaciones)
      - `id` (uuid, PK)
      - `user_id` (uuid, FK a auth.users)
      - `employee_id` (uuid, FK a employees)
      - `check_time` (timestamptz) - Hora de marcación
      - `check_type` (text) - 'IN' o 'OUT'
      - `device_id` (text) - ID del dispositivo que registró
      - `location` (text) - Ubicación opcional
      - `created_at` (timestamptz)
      
    - `api_keys` - Claves API para dispositivos externos
      - `id` (uuid, PK)
      - `user_id` (uuid, FK a auth.users)
      - `key_name` (text) - Nombre descriptivo
      - `api_key` (text, unique) - La clave API
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `last_used_at` (timestamptz)
      
  2. Seguridad
    - Habilitar RLS en ambas tablas
    - Políticas para que usuarios solo vean sus propios datos
*/

-- Crear tabla de registros de asistencia
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  check_time timestamptz NOT NULL DEFAULT now(),
  check_type text NOT NULL CHECK (check_type IN ('IN', 'OUT')),
  device_id text,
  location text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_check_time ON attendance_records(check_time);

-- Habilitar RLS
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para attendance_records
CREATE POLICY "Users can view own attendance records"
  ON attendance_records
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own attendance records"
  ON attendance_records
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can update own attendance records"
  ON attendance_records
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own attendance records"
  ON attendance_records
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Crear tabla de API keys
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  key_name text NOT NULL,
  api_key text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz
);

-- Crear índice para búsqueda rápida de API keys
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(api_key) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);

-- Habilitar RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para api_keys
CREATE POLICY "Users can view own API keys"
  ON api_keys
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own API keys"
  ON api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own API keys"
  ON api_keys
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own API keys"
  ON api_keys
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());