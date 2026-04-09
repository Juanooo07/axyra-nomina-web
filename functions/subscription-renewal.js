const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Inicializar Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Función para verificar renovaciones diariamente
exports.checkRenewals = functions.pubsub.schedule('0 0 * * *').onRun(async (context) => {
    console.log('🔄 Iniciando verificación de renovaciones automáticas...');
    
    try {
        const today = new Date();
        const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
        
        // Buscar membresías que vencen en 3 días
        const expiringMemberships = await db.collection('users')
            .where('membership.endDate', '<=', threeDaysFromNow)
            .where('membership.status', '==', 'active')
            .where('membership.autoRenewal', '==', true)
            .get();

        console.log(`📊 Encontradas ${expiringMemberships.size} membresías próximas a vencer`);

        for (const doc of expiringMemberships.docs) {
            const user = doc.data();
            const membership = user.membership;
            
            console.log(`🔄 Procesando renovación para usuario: ${doc.id}, Plan: ${membership.plan}`);
            
            try {
                await attemptAutoRenewal(doc.id, membership, user);
            } catch (error) {
                console.error(`❌ Error renovando membresía para usuario ${doc.id}:`, error);
                await handleRenewalFailure(doc.id, membership, error.message);
            }
        }

        console.log('✅ Verificación de renovaciones completada');
        return null;
    } catch (error) {
        console.error('❌ Error en verificación de renovaciones:', error);
        return null;
    }
});

// Función para intentar renovación automática
async function attemptAutoRenewal(userId, membership, userData) {
    try {
        console.log(`💳 Intentando renovación automática para usuario: ${userId}`);
        
        // Crear nueva transacción en Wompi
        const renewalTransaction = {
            amount_in_cents: getPlanPrice(membership.plan) * 100,
            currency: 'COP',
            customer_email: userData.email,
            reference: `AXYRA-RENEWAL-${membership.plan}-${Date.now()}`,
            payment_method: { type: 'CARD' },
            customer_data: {
                full_name: userData.displayName || userData.email,
                phone_number: userData.phoneNumber || '+573000000000'
            }
        };

        // Llamar a la API de Wompi para crear la transacción
        const wompiResponse = await createWompiTransaction(renewalTransaction);
        
        if (wompiResponse.status === 'PENDING') {
            // La transacción está pendiente, Wompi procesará el pago
            console.log(`⏳ Transacción de renovación creada: ${wompiResponse.transaction_id}`);
            
            // Actualizar estado del usuario
            await db.collection('users').doc(userId).update({
                'membership.renewalStatus': 'pending',
                'membership.renewalTransactionId': wompiResponse.transaction_id,
                'membership.lastRenewalAttempt': admin.firestore.FieldValue.serverTimestamp()
            });

            // Enviar notificación de renovación pendiente
            await sendRenewalPendingNotification(userId, membership.plan);
        } else {
            throw new Error(`Wompi devolvió estado inesperado: ${wompiResponse.status}`);
        }
    } catch (error) {
        console.error(`❌ Error en renovación automática para ${userId}:`, error);
        throw error;
    }
}

// Función para crear transacción en Wompi
async function createWompiTransaction(transactionData) {
    try {
        const wompiApiUrl = process.env.WOMPI_ENVIRONMENT === 'production' 
            ? 'https://production.wompi.co/v1/transactions'
            : 'https://sandbox.wompi.co/v1/transactions';

        const response = await fetch(wompiApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.WOMPI_PRIVATE_KEY}`
            },
            body: JSON.stringify(transactionData)
        });

        if (!response.ok) {
            throw new Error(`Wompi API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('❌ Error creando transacción en Wompi:', error);
        throw error;
    }
}

// Función para manejar fallos en renovación
async function handleRenewalFailure(userId, membership, errorMessage) {
    try {
        await db.collection('users').doc(userId).update({
            'membership.renewalStatus': 'failed',
            'membership.lastRenewalAttempt': admin.firestore.FieldValue.serverTimestamp(),
            'membership.renewalFailureReason': errorMessage
        });

        // Enviar notificación de fallo en renovación
        await sendRenewalFailedNotification(userId, membership.plan, errorMessage);
        
        // Si falla múltiples veces, desactivar auto-renovación
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        const failureCount = userData.membership.renewalFailureCount || 0;
        
        if (failureCount >= 3) {
            await db.collection('users').doc(userId).update({
                'membership.autoRenewal': false,
                'membership.status': 'renewal_failed'
            });
            
            console.log(`⚠️ Auto-renovación desactivada para usuario ${userId} después de 3 fallos`);
        } else {
            await db.collection('users').doc(userId).update({
                'membership.renewalFailureCount': failureCount + 1
            });
        }
    } catch (error) {
        console.error('❌ Error manejando fallo de renovación:', error);
    }
}

// Función para obtener precio del plan
function getPlanPrice(planId) {
    const prices = {
        'basic': 49900,
        'professional': 129900,
        'enterprise': 259900
    };
    return prices[planId] || 0;
}

// Función para enviar notificación de renovación pendiente
async function sendRenewalPendingNotification(userId, planId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        console.log(`📧 Enviando notificación de renovación pendiente a: ${userData.email}`);
        
        // Aquí integrarías con tu servicio de email
        // await sendEmail({
        //     to: userData.email,
        //     subject: 'Renovación de suscripción AXYRA en proceso',
        //     template: 'renewal_pending',
        //     data: { planId, userName: userData.displayName }
        // });
        
        console.log(`✅ Notificación de renovación pendiente enviada a ${userData.email}`);
    } catch (error) {
        console.error('❌ Error enviando notificación de renovación pendiente:', error);
    }
}

// Función para enviar notificación de fallo en renovación
async function sendRenewalFailedNotification(userId, planId, errorMessage) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        console.log(`📧 Enviando notificación de fallo en renovación a: ${userData.email}`);
        
        // Aquí integrarías con tu servicio de email
        // await sendEmail({
        //     to: userData.email,
        //     subject: 'Error en renovación de suscripción AXYRA',
        //     template: 'renewal_failed',
        //     data: { planId, userName: userData.displayName, errorMessage }
        // });
        
        console.log(`✅ Notificación de fallo en renovación enviada a ${userData.email}`);
    } catch (error) {
        console.error('❌ Error enviando notificación de fallo en renovación:', error);
    }
}

// Función para verificar membresías expiradas (ejecutar cada hora)
exports.checkExpiredMemberships = functions.pubsub.schedule('0 * * * *').onRun(async (context) => {
    console.log('⏰ Verificando membresías expiradas...');
    
    try {
        const now = new Date();
        
        // Buscar membresías que han expirado
        const expiredMemberships = await db.collection('users')
            .where('membership.endDate', '<=', now)
            .where('membership.status', '==', 'active')
            .get();

        console.log(`📊 Encontradas ${expiredMemberships.size} membresías expiradas`);

        for (const doc of expiredMemberships.docs) {
            const user = doc.data();
            const membership = user.membership;
            
            console.log(`⏰ Desactivando membresía expirada para usuario: ${doc.id}`);
            
            // Desactivar membresía
            await db.collection('users').doc(doc.id).update({
                'membership.status': 'expired',
                'membership.expiredAt': admin.firestore.FieldValue.serverTimestamp()
            });

            // Enviar notificación de expiración
            await sendMembershipExpiredNotification(doc.id, membership.plan);
        }

        console.log('✅ Verificación de membresías expiradas completada');
        return null;
    } catch (error) {
        console.error('❌ Error verificando membresías expiradas:', error);
        return null;
    }
});

// Función para enviar notificación de membresía expirada
async function sendMembershipExpiredNotification(userId, planId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        console.log(`📧 Enviando notificación de membresía expirada a: ${userData.email}`);
        
        // Aquí integrarías con tu servicio de email
        // await sendEmail({
        //     to: userData.email,
        //     subject: 'Tu suscripción AXYRA ha expirado',
        //     template: 'membership_expired',
        //     data: { planId, userName: userData.displayName }
        // });
        
        console.log(`✅ Notificación de membresía expirada enviada a ${userData.email}`);
    } catch (error) {
        console.error('❌ Error enviando notificación de membresía expirada:', error);
    }
}
