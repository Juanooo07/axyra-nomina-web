# 🔧 Para ejecutar la migración de Google Tokens

1. Abre **Supabase Dashboard**: https://app.supabase.com
2. Selecciona el proyecto **axyra-nomina-web**
3. Ve a **SQL Editor**
4. Copia el contenido del archivo `supabase/migrations/20260124_create_google_tokens_table.sql`
5. Pégalo en el SQL Editor
6. Haz clic en **Run** (o presiona Ctrl+Enter)

## Lo que hace esta migración:
- ✅ Crea tabla `user_google_tokens` para almacenar tokens de Google
- ✅ Configura Row Level Security (RLS) para seguridad
- ✅ Permite que cada usuario acceda solo a sus propios tokens
- ✅ Crea índices para optimizar consultas

## Después de ejecutar:
El botón "A Drive" en Detalles de Nómina debería funcionar correctamente y podrás autorizar con Google.
