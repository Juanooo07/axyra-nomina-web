# Recuperación: Porcentajes de Horas (hour_surcharges)

## 📋 Estructura de la Tabla `hour_surcharges`

```sql
CREATE TABLE hour_surcharges (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hour_type_name VARCHAR(255),
  surcharge_percent NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 🔄 Tipos de Horas Estándar (del Código)

Basado en el análisis del código, estos son los tipos de horas definidos:

| Tipo de Hora | Recargo % | Descripción |
|---|---|---|
| Hora Ordinaria | 0% | Horas normales de trabajo |
| Hora Extra Diurna | 25% | Horas extras durante el día |
| Hora Extra Nocturna | 75% | Horas extras durante la noche |
| Hora Nocturna | 35% | Horas trabajo nocturno regular |
| Hora Dominical | 100% | Horas trabajo en domingo |
| Hora Dominical Extra | 150% | Horas extras en domingo |
| Hora Festiva | 100% | Horas trabajo día festivo |
| Hora Festiva Extra | 150% | Horas extras en día festivo |

## 💾 Script SQL para Restaurar Datos

### Opción 1: Inserts Individuales (Recomendado)

```sql
-- Asegúrate de reemplazar 'YOUR_USER_ID' con tu ID de usuario real
INSERT INTO hour_surcharges (id, user_id, hour_type_name, surcharge_percent, created_at)
VALUES
  (gen_random_uuid(), 'YOUR_USER_ID', 'Hora Ordinaria', 0, NOW()),
  (gen_random_uuid(), 'YOUR_USER_ID', 'Hora Extra Diurna', 25, NOW()),
  (gen_random_uuid(), 'YOUR_USER_ID', 'Hora Extra Nocturna', 75, NOW()),
  (gen_random_uuid(), 'YOUR_USER_ID', 'Hora Nocturna', 35, NOW()),
  (gen_random_uuid(), 'YOUR_USER_ID', 'Hora Dominical', 100, NOW()),
  (gen_random_uuid(), 'YOUR_USER_ID', 'Hora Dominical Extra', 150, NOW()),
  (gen_random_uuid(), 'YOUR_USER_ID', 'Hora Festiva', 100, NOW()),
  (gen_random_uuid(), 'YOUR_USER_ID', 'Hora Festiva Extra', 150, NOW());
```

### Opción 2: Verificar Datos Existentes Primero

```sql
-- Ver qué datos ya existen
SELECT * FROM hour_surcharges WHERE user_id = 'YOUR_USER_ID' ORDER BY hour_type_name;

-- Eliminar datos incorrectos si es necesario
DELETE FROM hour_surcharges WHERE user_id = 'YOUR_USER_ID';

-- Luego ejecutar los inserts de la Opción 1
```

## 📍 Cálculos de Porcentajes (Fórmula)

```
Valor por Hora Final = Valor Base × (1 + surcharge_percent / 100)

Ejemplo con surcharge de 25%:
  Si valor base = $1,000
  Valor final = $1,000 × (1 + 25/100) = $1,000 × 1.25 = $1,250
```

## 🔧 Cómo Usar en el Código

El componente `HourTypes.tsx` carga automáticamente estos valores:

```tsx
const loadSurcharges = async () => {
  const { data, error } = await supabase
    .from('hour_surcharges')
    .select('*')
    .eq('user_id', user.id)
    .order('hour_type_name');
  
  setSurcharges(data || []);
};
```

## ✅ Pasos para Restaurar

1. **Obtener tu User ID** desde Supabase:
   - Ve a Authentication → Users
   - Copia el ID del usuario

2. **Ejecutar el Script SQL**:
   - Ve a Supabase → SQL Editor
   - Crea una nueva query
   - Reemplaza `'YOUR_USER_ID'` con tu ID real
   - Ejecuta la query

3. **Verificar Restauración**:
   - Ve a `HourTypes` en la app
   - Deberías ver todos los tipos de hora con sus porcentajes

## 📊 Relaciones con Otras Tablas

```
hour_surcharges
    ↓
hour_records (usa hour_type_name para buscar surcharge_percent)
    ↓
payroll (calcula earnings basado en surcharge_percent)
```

## 🚨 Notas Importantes

- Los porcentajes son **por usuario** (user_id)
- El campo `hour_type_name` es la clave para vincular con registros de horas
- Si modificas un porcentaje, afecta **futuros cálculos** pero no los ya guardados
- Considera hacer backups periódicos de esta tabla crítica

## 🔍 Validaciones en el Código

```tsx
// En Payroll.tsx se valida:
const surchargePercent = surchargeMap.get(hourType) || 0;
hourly_rate * (1 + surchargePercent / 100)
```

**Si un tipo de hora no existe en surcharges, usa 0% como default.**
