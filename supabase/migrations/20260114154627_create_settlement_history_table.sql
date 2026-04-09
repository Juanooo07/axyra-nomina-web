/*
  # Crear Tabla de Historial de Liquidaciones

  1. Nueva Tabla
    - `settlement_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `employee_name` (text) - Nombre del empleado liquidado
      - `fecha_inicio` (date) - Fecha de inicio del período
      - `fecha_fin` (date) - Fecha de fin del período
      - `modalidad` (text) - DIAS o HORAS
      - `dias_trabajados` (integer, nullable) - Días trabajados si aplica
      - `horas_totales` (numeric, nullable) - Horas totales si aplica
      - `horas_por_dia` (numeric, nullable) - Horas por día si aplica
      - `base_mode` (text) - SMMLV o MANUAL
      - `salario_base_mensual` (numeric) - Salario base usado
      - `aplica_aux_transporte` (boolean) - Si aplica auxilio de transporte
      - `incluir_cesantias` (boolean) - Si incluye cesantías
      - `incluir_intereses_cesantias` (boolean) - Si incluye intereses
      - `incluir_prima` (boolean) - Si incluye prima
      - `incluir_vacaciones` (boolean) - Si incluye vacaciones
      - `dias_totales` (integer) - Total de días calculados
      - `breakdown_por_anio` (jsonb) - JSON con el desglose por año
      - `total_general` (numeric) - Total general de la liquidación
      - `created_at` (timestamptz) - Fecha de creación
      
  2. Seguridad
    - Habilitar RLS en la tabla
    - Políticas para que usuarios solo vean sus propias liquidaciones
    - Políticas para insertar, actualizar y eliminar propias liquidaciones
*/

CREATE TABLE IF NOT EXISTS settlement_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  employee_name text NOT NULL DEFAULT '',
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  modalidad text NOT NULL DEFAULT 'DIAS',
  dias_trabajados integer,
  horas_totales numeric,
  horas_por_dia numeric,
  base_mode text NOT NULL DEFAULT 'SMMLV',
  salario_base_mensual numeric NOT NULL DEFAULT 0,
  aplica_aux_transporte boolean NOT NULL DEFAULT true,
  incluir_cesantias boolean NOT NULL DEFAULT true,
  incluir_intereses_cesantias boolean NOT NULL DEFAULT true,
  incluir_prima boolean NOT NULL DEFAULT true,
  incluir_vacaciones boolean NOT NULL DEFAULT true,
  dias_totales integer NOT NULL DEFAULT 0,
  breakdown_por_anio jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_general numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE settlement_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settlement history"
  ON settlement_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settlement history"
  ON settlement_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settlement history"
  ON settlement_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settlement history"
  ON settlement_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_settlement_history_user_id ON settlement_history(user_id);
CREATE INDEX IF NOT EXISTS idx_settlement_history_created_at ON settlement_history(created_at DESC);
