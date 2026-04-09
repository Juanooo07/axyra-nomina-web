# Política de Seguridad

## Versiones Soportadas

| Versión | Soportada          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reportar una Vulnerabilidad

Si has encontrado una vulnerabilidad de seguridad, por favor sigue estos pasos:

1. **NO** crees un issue público
2. Envía un email a: security@axyra.app
3. Incluye la siguiente información:
   - Descripción detallada de la vulnerabilidad
   - Pasos para reproducir el problema
   - Impacto potencial
   - Cualquier información adicional relevante

## Tiempo de Respuesta

- **Respuesta inicial**: 24 horas
- **Resolución**: 7 días hábiles (para vulnerabilidades críticas)
- **Actualizaciones**: Cada 48 horas

## Recompensas

Actualmente no ofrecemos recompensas por vulnerabilidades, pero agradecemos tu contribución a la seguridad del proyecto.

## Mejores Prácticas de Seguridad

### Para Desarrolladores

- Siempre valida la entrada del usuario
- Usa HTTPS en producción
- Mantén las dependencias actualizadas
- Implementa autenticación y autorización adecuadas
- No hardcodees credenciales en el código

### Para Usuarios

- Usa contraseñas fuertes y únicas
- Habilita la autenticación de dos factores cuando esté disponible
- Mantén tu navegador actualizado
- No compartas tus credenciales de acceso

## Contacto

Para preguntas sobre seguridad, contacta a:

- Email: security@axyra.app
- Equipo: AXYRA Security Team

## Historial de Seguridad

### 2024-01-15

- Implementadas reglas de Firestore mejoradas
- Agregadas validaciones de entrada más estrictas
- Mejorado el sistema de autenticación

### 2024-01-10

- Corregida vulnerabilidad XSS en formularios
- Implementadas políticas de CORS más estrictas
- Agregadas validaciones de autorización
