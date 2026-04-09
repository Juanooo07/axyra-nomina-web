// ========================================
// API ENDPOINT PARA PROCESAR PAGOS WOMPI
// ========================================
// Vercel Serverless Function para manejar pagos de Wompi

const admin = require('firebase-admin');
const secureCors = require('./middleware/secureCors');
const { payment: paymentRateLimit, webhook: webhookRateLimit } = require('./middleware/rateLimit');

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

/**
 * Procesa un pago de Wompi
 */
async function processWompiPayment(req, res) {
  // ✅ Aplicar CORS seguro (solo dominios permitidos en whitelist)
  secureCors(req, res);
  
  // ✅ Aplicar rate limiting (máximo 5 requests per 15 minutos)
  paymentRateLimit(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { transactionId, reference, amount, status, userId, planType } = req.body;

    // Validar datos requeridos
    if (!transactionId || !reference || !userId || !planType) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos',
      });
    }

    // Verificar que el pago esté aprobado
    if (status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        error: 'El pago no está aprobado',
      });
    }

    // Verificar la transacción con Wompi
    const wompiResponse = await verifyWompiTransaction(transactionId);

    if (!wompiResponse.success) {
      return res.status(400).json({
        success: false,
        error: 'Error verificando transacción con Wompi',
      });
    }

    // Actualizar el plan del usuario
    const updateResult = await updateUserPlan(userId, planType, {
      transactionId,
      reference,
      amount,
      status,
      paymentMethod: 'wompi',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    if (updateResult.success) {
      // Crear registro de transacción
      await createTransactionRecord({
        userId,
        planType,
        amount,
        status,
        paymentMethod: 'wompi',
        transactionId,
        reference,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({
        success: true,
        message: 'Plan actualizado exitosamente',
        plan: planType,
        status: 'active',
        hasAccess: true,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Error actualizando el plan del usuario',
      });
    }
  } catch (error) {
    console.error('Error procesando pago Wompi:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
}

/**
 * Verifica una transacción con Wompi
 */
async function verifyWompiTransaction(transactionId) {
  try {
    // ✅ SEGURO: Usar variables de entorno, NUNCA hardcodear claves privadas
    const wompiConfig = {
      publicKey: process.env.WOMPI_PUBLIC_KEY,
      privateKey: process.env.WOMPI_PRIVATE_KEY, // ← De .env, no hardcodeado
      baseUrl: 'https://production.wompi.co/v1',
    };

    // Validar que las claves estén configuradas
    if (!wompiConfig.privateKey || !wompiConfig.publicKey) {
      throw new Error('WOMPI_PUBLIC_KEY o WOMPI_PRIVATE_KEY no configuradas en variables de entorno');
    }

    const response = await fetch(`${wompiConfig.baseUrl}/transactions/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${wompiConfig.privateKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Error verificando transacción Wompi:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Actualiza el plan del usuario
 */
async function updateUserPlan(userId, planType, paymentData) {
  try {
    const userRef = db.collection('users').doc(userId);

    // Obtener datos actuales del usuario
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return {
        success: false,
        error: 'Usuario no encontrado',
      };
    }

    const userData = userDoc.data();

    // Actualizar plan y datos de pago
    await userRef.update({
      plan: planType,
      planStatus: 'active',
      hasAccess: true,
      lastPayment: paymentData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: 'Plan actualizado exitosamente',
    };
  } catch (error) {
    console.error('Error actualizando plan del usuario:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Crea un registro de transacción
 */
async function createTransactionRecord(transactionData) {
  try {
    await db.collection('transactions').add(transactionData);
    console.log('Registro de transacción creado:', transactionData);
  } catch (error) {
    console.error('Error creando registro de transacción:', error);
  }
}

/**
 * Webhook de Wompi para eventos
 */
async function wompiWebhook(req, res) {
  // ✅ Aplicar CORS seguro (solo dominios permitidos en whitelist)
  secureCors(req, res);
  
  // ✅ Aplicar rate limiting para webhooks
  webhookRateLimit(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const event = req.body;

    // Verificar la firma del webhook (opcional pero recomendado)
    // const signature = req.headers['x-wompi-signature'];
    // if (!verifyWompiSignature(event, signature)) {
    //   return res.status(401).json({ error: 'Firma inválida' });
    // }

    console.log('Webhook Wompi recibido:', event);

    // Procesar diferentes tipos de eventos
    switch (event.event) {
      case 'transaction.updated':
        await handleTransactionUpdate(event.data);
        break;
      case 'transaction.approved':
        await handleTransactionApproved(event.data);
        break;
      case 'transaction.declined':
        await handleTransactionDeclined(event.data);
        break;
      default:
        console.log('Evento no manejado:', event.event);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error procesando webhook Wompi:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
}

/**
 * Maneja actualización de transacción
 */
async function handleTransactionUpdate(transactionData) {
  console.log('Transacción actualizada:', transactionData);
  // Implementar lógica específica si es necesario
}

/**
 * Maneja transacción aprobada
 */
async function handleTransactionApproved(transactionData) {
  console.log('Transacción aprobada:', transactionData);
  // Implementar lógica específica si es necesario
}

/**
 * Maneja transacción rechazada
 */
async function handleTransactionDeclined(transactionData) {
  console.log('Transacción rechazada:', transactionData);
  // Implementar lógica específica si es necesario
}

// ========================================
// EXPORTACIONES
// ========================================
module.exports = {
  processWompiPayment,
  wompiWebhook,
};
