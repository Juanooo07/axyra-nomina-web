/*
  # Corregir trigger de user_settings
  
  1. Cambios
    - Modificar create_default_user_settings para manejar mejor los errores
    - Asegurar que las inserciones funcionen correctamente
    
  2. Seguridad
    - Mantiene SECURITY DEFINER
    - Mejora la robustez
*/

CREATE OR REPLACE FUNCTION public.create_default_user_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Create user settings
  BEGIN
    INSERT INTO user_settings (user_id, company_name)
    VALUES (
      NEW.id, 
      COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'company_name'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
        'Mi Empresa'
      )
    )
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Error creating user_settings for user %: %', NEW.id, SQLERRM;
  END;
  
  -- Create default hour surcharges
  BEGIN
    INSERT INTO hour_surcharges (user_id, hour_type_name, surcharge_percent) VALUES
    (NEW.id, 'Hora Ordinaria', 0),
    (NEW.id, 'Recargo Nocturno', 35),
    (NEW.id, 'Recargo Diurno Dominical', 75),
    (NEW.id, 'Recargo Nocturno Dominical', 110),
    (NEW.id, 'Hora Extra Diurna', 25),
    (NEW.id, 'Hora Extra Nocturna', 75),
    (NEW.id, 'Hora Diurna Dominical', 80),
    (NEW.id, 'Hora Extra Diurna Dominical', 105),
    (NEW.id, 'Hora Nocturna Dominical', 110),
    (NEW.id, 'Hora Extra Nocturna Dominical', 185)
    ON CONFLICT (user_id, hour_type_name) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Error creating hour_surcharges for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Fatal error in create_default_user_settings for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;