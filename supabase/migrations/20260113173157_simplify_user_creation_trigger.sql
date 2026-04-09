/*
  # Simplificar trigger de creación de usuario
  
  1. Cambios
    - Modificar handle_new_user para que siempre use un valor válido para full_name
    - Mejorar manejo de errores
    
  2. Seguridad
    - Mantiene SECURITY DEFINER
    - Mejora la robustez del proceso de registro
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert profile with better default values
  INSERT INTO public.profiles (
    id, 
    full_name, 
    phone, 
    company_name, 
    position
  )
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      SPLIT_PART(NEW.email, '@', 1)
    ),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'company_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'position'), '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;