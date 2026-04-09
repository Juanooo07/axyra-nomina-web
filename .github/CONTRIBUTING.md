# Guía de Contribución

¡Gracias por tu interés en contribuir a AXYRA! Esta guía te ayudará a entender cómo puedes contribuir al proyecto.

## Cómo Contribuir

### 1. Fork del Repositorio

1. Haz fork del repositorio
2. Clona tu fork localmente
3. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`

### 2. Configuración del Entorno

```bash
# Clona el repositorio
git clone https://github.com/tu-usuario/axyra-sistema-gestion.git
cd axyra-sistema-gestion

# Instala dependencias
npm install

# Configura Firebase (opcional para desarrollo)
firebase login
firebase use --add

# Inicia el servidor de desarrollo
npm run dev
```

### 3. Hacer Cambios

- Sigue las convenciones de código del proyecto
- Agrega comentarios donde sea necesario
- Prueba tus cambios localmente
- Asegúrate de que no hay errores de consola

### 4. Crear Pull Request

1. Commit tus cambios: `git commit -m "feat: agregar nueva funcionalidad"`
2. Push a tu fork: `git push origin feature/nueva-funcionalidad`
3. Crea un Pull Request desde GitHub

## Convenciones de Código

### JavaScript

- Usa ES6+ features
- Sigue el estilo de código existente
- Usa `const` y `let` en lugar de `var`
- Usa arrow functions cuando sea apropiado
- Agrega JSDoc para funciones complejas

### HTML

- Usa indentación de 2 espacios
- Usa atributos en minúsculas
- Agrega atributos `alt` a las imágenes
- Usa semántica HTML apropiada

### CSS

- Usa BEM methodology para clases
- Usa variables CSS para colores y medidas
- Mantén el código organizado y comentado
- Usa flexbox y grid cuando sea apropiado

## Estructura del Proyecto

```
axyra-sistema-gestion/
├── api/                    # API endpoints
├── frontend/              # Frontend application
│   ├── modulos/          # Módulos de la aplicación
│   └── static/           # Archivos estáticos
├── functions/            # Firebase Cloud Functions
├── docs/                # Documentación
└── scripts/             # Scripts de utilidad
```

## Tipos de Contribuciones

### 🐛 Bug Fixes

- Corrige errores existentes
- Mejora la estabilidad del sistema
- Agrega validaciones faltantes

### ✨ Nuevas Funcionalidades

- Agrega nuevas características
- Mejora la experiencia del usuario
- Implementa mejoras de rendimiento

### 📚 Documentación

- Mejora la documentación existente
- Agrega ejemplos de uso
- Crea guías de usuario

### 🔧 Mejoras Técnicas

- Refactoring de código
- Optimización de rendimiento
- Mejoras de seguridad

## Proceso de Revisión

1. **Revisión de Código**: Tu PR será revisado por el equipo
2. **Testing**: Verificamos que no hay regresiones
3. **Aprobación**: Una vez aprobado, se mergea a main
4. **Despliegue**: Se despliega automáticamente a producción

## Reportar Issues

### Bug Reports

- Usa el template de bug report
- Incluye pasos para reproducir
- Agrega screenshots si es necesario
- Especifica el navegador y OS

### Feature Requests

- Usa el template de feature request
- Describe el problema que resuelve
- Incluye mockups si es posible
- Explica el valor para los usuarios

## Comunicación

- **Issues**: Para bugs y feature requests
- **Discussions**: Para preguntas generales
- **Email**: axyra.app@gmail.com para temas urgentes

## Código de Conducta

- Sé respetuoso y constructivo
- Ayuda a otros desarrolladores
- Mantén el foco en el proyecto
- Sigue las mejores prácticas

## Reconocimientos

- Los contribuidores serán reconocidos en el README
- Los commits aparecerán en el historial del proyecto
- Agradecemos todas las contribuciones, grandes y pequeñas

## Preguntas Frecuentes

### ¿Puedo contribuir sin experiencia previa?

¡Sí! Hay muchas formas de contribuir, desde documentación hasta testing.

### ¿Cómo sé qué trabajar?

Revisa los issues etiquetados como "good first issue" o "help wanted".

### ¿Qué pasa si mi PR es rechazado?

No te preocupes, es parte del proceso. Revisa los comentarios y mejora tu código.

## Contacto

- **Email**: axyra.app@gmail.com
- **GitHub**: @axyra-team
- **Website**: https://axyra.vercel.app

¡Gracias por contribuir a AXYRA! 🚀
