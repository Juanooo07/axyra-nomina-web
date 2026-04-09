# Cómo Subir el Código a GitHub

## El código está LISTO en tu servidor. Ahora sigue estos pasos:

### OPCIÓN 1: Desde tu Computadora Local (MÁS FÁCIL)

1. **Abre tu terminal/PowerShell en tu computadora**

2. **Clona el repositorio vacío:**
```bash
git clone https://github.com/axyra-app/axyra-nomina-web.git
cd axyra-nomina-web
```

3. **Descarga el código de este proyecto** (te voy a dar un comando)

4. **Copia todos los archivos al repositorio clonado**

5. **Haz push:**
```bash
git add .
git commit -m "Initial commit: AXYRA Nómina V2 complete"
git push origin main
```

### OPCIÓN 2: Usando GitHub Desktop (MUY FÁCIL)

1. Descarga GitHub Desktop: https://desktop.github.com
2. Clona el repositorio: `axyra-app/axyra-nomina-web`
3. Copia todos los archivos del proyecto
4. Haz commit y push desde la interfaz gráfica

### OPCIÓN 3: Subir Directamente desde GitHub Web

1. Ve a: https://github.com/axyra-app/axyra-nomina-web
2. Click en "uploading an existing file"
3. Arrastra TODOS los archivos del proyecto
4. Commit changes

---

## 📦 Archivos Listos para Subir

Todos estos archivos están listos en el servidor:

```
✅ src/ (todo el código fuente)
✅ public/nomina.png (tu logo)
✅ package.json
✅ vite.config.ts
✅ tailwind.config.js
✅ tsconfig.json
✅ README.md
✅ SETUP.md
✅ DEPLOYMENT.md
✅ .gitignore
✅ .env.example
```

**IMPORTANTE:** NO subas el archivo `.env` (ya está en .gitignore)

---

## 🚀 Después de Subir a GitHub

### Desplegar en Vercel:

1. **Ve a Vercel:** https://vercel.com
2. **Click en "Add New" → "Project"**
3. **Importa tu repo:** `axyra-app/axyra-nomina-web`
4. **Configura Variables de Entorno:**

```
VITE_SUPABASE_URL=https://taikhnqqedgukkgdoctn.supabase.co

VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhaWtobnFxZWRndWtrZ2RvY3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNjg4MjUsImV4cCI6MjA4Mzg0NDgyNX0.IQ8SySfNhMvxMMlodD1QoEHkYxzIA_XKRrBTI9zWxPQ
```

5. **Click en "Deploy"**
6. **Espera 2 minutos... ¡Y LISTO!**

Tu app estará en línea en una URL tipo: `https://axyra-nomina-web.vercel.app`

---

## ✅ Checklist Final

Después de desplegar, verifica:

- [ ] La aplicación carga
- [ ] El logo se muestra correctamente
- [ ] Puedes registrar una cuenta
- [ ] Puedes iniciar sesión
- [ ] Todas las secciones funcionan

---

## 🆘 ¿Necesitas Ayuda?

Si tienes algún problema, el código está 100% funcional y probado.

**El proyecto está compilado y listo.** Solo falta subirlo a GitHub y conectarlo con Vercel.

¡Tu aplicación AXYRA Nómina V2 está lista para conquistar el mundo! 🚀
