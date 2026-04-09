const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const express = require('express');

// Inicializar Firebase Admin
admin.initializeApp();

// Crear app Express
const app = express();
app.use(cors);

// Middleware de autenticación
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autorización requerido' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Rutas de la API
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AXYRA API funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

app.get('/test', (req, res) => {
  res.json({
    message: 'Test endpoint funcionando',
    data: { test: true },
  });
});

// Exportar la función
exports.api = functions.https.onRequest(app);
