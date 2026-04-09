# 🔒 VARIABLES DE ENTORNO REQUERIDAS - FASE 1 IMPLEMENTADA

## CONFIGURACIÓN INMEDIATA (HOY)

Debes configurar estas variables en tu plataforma de hosting (Vercel, Heroku, Firebase, etc.):

### 🔐 **Wompi Payment Gateway**
```
WOMPI_PUBLIC_KEY=pub_prod_tu_clave_publica
WOMPI_PRIVATE_KEY=prv_prod_tu_clave_privada
```

**¿Dónde obtenerlas?**
1. Ve a https://dashboard.wompi.co/
2. Inicia sesión
3. Ve a Configuración → Claves API
4. Copia la clave pública y privada
5. Agrega a tu plataforma de hosting

---

### 💳 **PayPal Payment Gateway**
```
PAYPAL_CLIENT_ID=tu_client_id_aqui
PAYPAL_CLIENT_SECRET=tu_client_secret_aqui
PAYPAL_ENVIRONMENT=production
PAYPAL_BASE_URL=https://api.paypal.com
```

**¿Dónde obtenerlas?**
1. Ve a https://developer.paypal.com/
2. Inicia sesión
3. Ve a Sandbox → Accounts o Applications
4. Copia Client ID y Secret
5. Agrega a tu plataforma

---

### 🔥 **Firebase (Opcional - Ya está configurado)**
```
FIREBASE_DATABASE_URL=https://tu-proyecto.firebaseio.com
```

---

## ✅ VERIFICACIÓN

Para verificar que las variables están correctas, ejecuta:

```bash
# En Vercel
vercel env ls

# En Firebase
firebase functions:config:get
```

---

## 🚨 IMPORTANTE

- **NUNCA** hardcodees claves en el código
- **SIEMPRE** usa variables de entorno
- Las claves privadas NUNCA van en el navegador (frontend)
- Solo el servidor (backend) debe tener acceso a claves privadas

---

## 📝 CHECKLIST

- [ ] WOMPI_PUBLIC_KEY configurada
- [ ] WOMPI_PRIVATE_KEY configurada
- [ ] PAYPAL_CLIENT_ID configurada
- [ ] PAYPAL_CLIENT_SECRET configurada
- [ ] PAYPAL_ENVIRONMENT = production
- [ ] Verifica que los endpoints funcionan
- [ ] Test CORS (solo tus dominios funcionan)
- [ ] Test Rate Limit (5 requests máximo)

