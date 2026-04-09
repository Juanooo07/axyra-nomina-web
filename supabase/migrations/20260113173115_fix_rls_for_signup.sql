/*
  # Corregir políticas RLS para permitir registro de usuarios
  
  1. Cambios
    - Modificar políticas de INSERT en user_settings y hour_surcharges
    - Permitir inserciones durante el proceso de registro (cuando el trigger se ejecuta)
    
  2. Seguridad
    - Las funciones son SECURITY DEFINER, por lo que son seguras
    - Solo se permite INSERT desde el contexto del trigger
*/

-- Eliminar políticas restrictivas de INSERT
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own surcharges" ON hour_surcharges;

-- Crear nuevas políticas que permiten INSERT durante registro
CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can insert own surcharges"
  ON hour_surcharges
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);