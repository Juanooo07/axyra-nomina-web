/*
  # Update Hour Type Names

  ## Overview
  Updates the hour type names in hour_surcharges table to match the new naming convention.

  ## Changes
  1. Update hour type names to match the simplified naming

  ## Notes
  - Changes from Spanish descriptions to simpler names
*/

-- Update hour type names to match new convention
UPDATE hour_surcharges SET hour_type_name = 'Hora Ordinaria' WHERE hour_type_name IN ('ORDINARIAS', 'Hora Ordinaria (0%)');
UPDATE hour_surcharges SET hour_type_name = 'Hora Extra Diurna' WHERE hour_type_name IN ('HORA_EXTRA_DIURNA', 'Hora Extra Diurna');
UPDATE hour_surcharges SET hour_type_name = 'Hora Nocturna' WHERE hour_type_name IN ('RECARGO_NOCTURNO', 'Recargo Nocturno');
UPDATE hour_surcharges SET hour_type_name = 'Hora Extra Nocturna' WHERE hour_type_name IN ('HORA_EXTRA_NOCTURNA', 'Hora Extra Nocturna');
UPDATE hour_surcharges SET hour_type_name = 'Hora Diurna Dominical' WHERE hour_type_name IN ('RECARGO_DIURNO_DOMINICAL', 'Hora Diurna Dominical', 'HORA_DIURNA_DOMINICAL');
UPDATE hour_surcharges SET hour_type_name = 'Hora Extra Diurna Dominical' WHERE hour_type_name IN ('HORA_EXTRA_DIURNA_DOMINICAL', 'Hora Extra Diurna Dominical');
UPDATE hour_surcharges SET hour_type_name = 'Hora Nocturna Dominical' WHERE hour_type_name IN ('RECARGO_NOCTURNO_DOMINICAL', 'Hora Nocturna Dominical', 'HORA_NOCTURNA_DOMINICAL');
UPDATE hour_surcharges SET hour_type_name = 'Hora Extra Nocturna Dominical' WHERE hour_type_name IN ('HORA_EXTRA_NOCTURNA_DOMINICAL', 'Hora Extra Nocturna Dominical');
