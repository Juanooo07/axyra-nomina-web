const crypto = require('crypto');
const admin = require('firebase-admin');
const secureCors = require('./middleware/secureCors');
const { webhook: webhookRateLimit } = require('./middleware/rateLimit');

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

const db = admin.firestore();

module.exports = async (req, res) => {
    // ✅ Aplicar CORS seguro (solo dominios permitidos en whitelist)
    secureCors(req, res);
    
    // ✅ Aplicar rate limiting (máximo 50 requests per 1 minuto para webhooks)
    webhookRateLimit(req, res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('🔔 Webhook de Wompi recibido:', req.body);

        // Verificar firma del webhook
        const signature = req.headers['x-wompi-signature'];
        const payload = JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac('sha256', process.env.WOMPI_WEBHOOK_SECRET)
            .update(payload)
            .digest('hex');

        if (signature !== expectedSignature) {
            console.error('❌ Firma de webhook inválida');
            return res.status(401).json({ error: 'Invalid signature' });
        }

        const { transaction_id, status, reference, amount_in_cents, currency } = req.body;
        
        console.log(`📊 Procesando transacción: ${transaction_id}, Estado: ${status}, Referencia: ${reference}`);

        if (status === 'APPROVED') {
            await processSuccessfulPayment(transaction_id, reference, amount_in_cents, currency);
        } else if (status === 'DECLINED') {
            await processFailedPayment(transaction_id, reference);
        }

        res.status(200).json({ received: true, status: 'processed' });
    } catch (error) {
        console.error('❌ Error procesando webhook de Wompi:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

async function processSuccessfulPayment(transactionId, reference, amount, currency) {
    try {
        console.log(`✅ Procesando pago exitoso: ${transactionId}`);
        
        // Extraer información del reference: "AXYRA-basic-1234567890" o "AXYRA-RENEWAL-basic-1234567890"
        const referenceParts = reference.split('-');
        const isRenewal = referenceParts[1] === 'RENEWAL';
        const planId = isRenewal ? referenceParts[2] : referenceParts[1];
        const timestamp = referenceParts[referenceParts.length - 1];

        // Buscar usuario por referencia o timestamp
        let userId = null;
        
        // Intentar encontrar usuario por referencia
        const usersSnapshot = await db.collection('users')
            .where('membership.reference', '==', reference)
            .limit(1)
            .get();

        if (!usersSnapshot.empty) {
            userId = usersSnapshot.docs[0].id;
        } else {
            // Buscar por timestamp reciente (últimas 24 horas)
            const recentTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const recentUsers = await db.collection('users')
                .where('membership.lastPaymentAttempt', '>=', recentTime)
                .get();

            if (!recentUsers.empty) {
                userId = recentUsers.docs[0].id;
            }
        }

        if (!userId) {
            console.error('❌ Usuario no encontrado para la referencia:', reference);
            return;
        }

        // Activar o renovar membresía
        if (isRenewal) {
            await renewMembership(userId, planId, transactionId, amount, currency);
        } else {
            await activateMembership(userId, planId, transactionId, amount, currency);
        }

        console.log(`✅ Pago procesado exitosamente para usuario: ${userId}`);
    } catch (error) {
        console.error('❌ Error procesando pago exitoso:', error);
        throw error;
    }
}

async function processFailedPayment(transactionId, reference) {
    try {
        console.log(`❌ Procesando pago fallido: ${transactionId}`);
        
        // Buscar usuario y actualizar estado
        const usersSnapshot = await db.collection('users')
            .where('membership.reference', '==', reference)
            .limit(1)
            .get();

        if (!usersSnapshot.empty) {
            const userId = usersSnapshot.docs[0].id;
            await db.collection('users').doc(userId).update({
                'membership.status': 'payment_failed',
                'membership.lastPaymentAttempt': admin.firestore.FieldValue.serverTimestamp(),
                'membership.failureReason': 'Payment declined by Wompi'
            });

            // Enviar notificación de pago fallido
            await sendPaymentFailedNotification(userId, reference);
        }
    } catch (error) {
        console.error('❌ Error procesando pago fallido:', error);
    }
}

async function activateMembership(userId, planId, transactionId, amount, currency) {
    try {
        const membershipData = {
            plan: planId,
            status: 'active',
            startDate: admin.firestore.FieldValue.serverTimestamp(),
            endDate: calculateEndDate(planId),
            paymentMethod: 'wompi',
            transactionId: transactionId,
            reference: `AXYRA-${planId}-${Date.now()}`,
            autoRenewal: true,
            lastPayment: admin.firestore.FieldValue.serverTimestamp(),
            amount: amount,
            currency: currency
        };

        // Actualizar membresía del usuario
        await db.collection('users').doc(userId).update({
            membership: membershipData,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });

        // Crear registro de pago
        await db.collection('payments').add({
            userId: userId,
            plan: planId,
            amount: amount,
            currency: currency,
            status: 'completed',
            paymentMethod: 'wompi',
            transactionId: transactionId,
            type: 'initial_payment',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        // Enviar notificación de activación
        await sendMembershipActivatedNotification(userId, planId);

        console.log(`✅ Membresía activada para usuario: ${userId}, Plan: ${planId}`);
    } catch (error) {
        console.error('❌ Error activando membresía:', error);
        throw error;
    }
}

async function renewMembership(userId, planId, transactionId, amount, currency) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        const currentMembership = userData.membership;

        const renewalData = {
            ...currentMembership,
            status: 'active',
            startDate: admin.firestore.FieldValue.serverTimestamp(),
            endDate: calculateEndDate(planId),
            transactionId: transactionId,
            reference: `AXYRA-RENEWAL-${planId}-${Date.now()}`,
            lastPayment: admin.firestore.FieldValue.serverTimestamp(),
            amount: amount,
            currency: currency,
            renewalCount: (currentMembership.renewalCount || 0) + 1
        };

        // Actualizar membresía
        await db.collection('users').doc(userId).update({
            membership: renewalData,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });

        // Crear registro de renovación
        await db.collection('payments').add({
            userId: userId,
            plan: planId,
            amount: amount,
            currency: currency,
            status: 'completed',
            paymentMethod: 'wompi',
            transactionId: transactionId,
            type: 'renewal',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        // Enviar notificación de renovación
        await sendMembershipRenewedNotification(userId, planId);

        console.log(`✅ Membresía renovada para usuario: ${userId}, Plan: ${planId}`);
    } catch (error) {
        console.error('❌ Error renovando membresía:', error);
        throw error;
    }
}

function calculateEndDate(planId) {
    const date = new Date();
    date.setMonth(date.getMonth() + 1); // 1 mes de duración
    return date;
}

async function sendMembershipActivatedNotification(userId, planId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        // Aquí podrías integrar con un servicio de email como SendGrid, Mailgun, etc.
        console.log(`📧 Enviando notificación de activación a: ${userData.email}`);
        
        // Por ahora, solo logueamos. En producción, enviarías un email real
        console.log(`✅ Membresía ${planId} activada para ${userData.displayName || userData.email}`);
    } catch (error) {
        console.error('❌ Error enviando notificación de activación:', error);
    }
}

async function sendMembershipRenewedNotification(userId, planId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        console.log(`📧 Enviando notificación de renovación a: ${userData.email}`);
        console.log(`✅ Membresía ${planId} renovada para ${userData.displayName || userData.email}`);
    } catch (error) {
        console.error('❌ Error enviando notificación de renovación:', error);
    }
}

async function sendPaymentFailedNotification(userId, reference) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        console.log(`📧 Enviando notificación de pago fallido a: ${userData.email}`);
        console.log(`❌ Pago fallido para ${userData.displayName || userData.email}, Referencia: ${reference}`);
    } catch (error) {
        console.error('❌ Error enviando notificación de pago fallido:', error);
    }
}
