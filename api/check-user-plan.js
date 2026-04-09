// ========================================
// API ENDPOINT CHECK USER PLAN - AXYRA
// ========================================
// Endpoint para verificar el plan del usuario

const admin = require('firebase-admin');
const secureCors = require('./middleware/secureCors');
const { api: apiRateLimit } = require('./middleware/rateLimit');

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

module.exports = async (req, res) => {
  // ✅ Aplicar CORS seguro (solo dominios permitidos en whitelist)
  secureCors(req, res);
  
  // ✅ Aplicar rate limiting (máximo 100 requests per 15 minutos)
  apiRateLimit(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      res.status(400).json({ error: 'userId es requerido' });
      return;
    }

    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const userData = userDoc.data();
    const currentPlan = userData.plan || 'free';
    const planStatus = userData.planStatus || 'inactive';
    const planEndDate = userData.planEndDate;

    // Verificar si el plan ha expirado
    let isActive = planStatus === 'active';
    if (planEndDate && planEndDate.toDate() < new Date()) {
      isActive = false;
      // Actualizar estado del plan
      await db.collection('users').doc(userId).update({
        planStatus: 'expired',
      });
    }

    res.status(200).json({
      plan: currentPlan,
      status: isActive ? 'active' : 'inactive',
      endDate: planEndDate ? planEndDate.toDate().toISOString() : null,
      hasAccess: isActive && currentPlan !== 'free',
    });
  } catch (error) {
    console.error('Error verificando plan del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
