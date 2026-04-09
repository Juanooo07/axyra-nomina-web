const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Inicializar Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Función para enviar notificaciones por email
exports.sendEmailNotification = functions.https.onCall(async (data, context) => {
    try {
        const { to, subject, template, templateData } = data;
        
        console.log(`📧 Enviando email a: ${to}, Asunto: ${subject}`);
        
        // Verificar autenticación
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
        }

        // Obtener plantilla de email
        const emailTemplate = getEmailTemplate(template, templateData);
        
        // Enviar email (aquí integrarías con SendGrid, Mailgun, etc.)
        await sendEmail({
            to: to,
            subject: subject,
            html: emailTemplate.html,
            text: emailTemplate.text
        });

        console.log(`✅ Email enviado exitosamente a: ${to}`);
        return { success: true, message: 'Email enviado correctamente' };
        
    } catch (error) {
        console.error('❌ Error enviando email:', error);
        throw new functions.https.HttpsError('internal', 'Error enviando email');
    }
});

// Función para enviar notificación de membresía activada
exports.sendMembershipActivatedEmail = functions.firestore
    .document('users/{userId}')
    .onUpdate(async (change, context) => {
        try {
            const before = change.before.data();
            const after = change.after.data();
            
            // Verificar si la membresía se activó
            if (before.membership?.status !== 'active' && after.membership?.status === 'active') {
                const userId = context.params.userId;
                const userData = after;
                const membership = after.membership;
                
                console.log(`📧 Enviando email de membresía activada para usuario: ${userId}`);
                
                await sendEmail({
                    to: userData.email,
                    subject: `¡Bienvenido a AXYRA ${membership.plan}!`,
                    template: 'membership_activated',
                    data: {
                        userName: userData.displayName || userData.email,
                        planName: getPlanName(membership.plan),
                        expiryDate: membership.endDate?.toDate().toLocaleDateString('es-CO'),
                        features: getPlanFeatures(membership.plan)
                    }
                });
            }
        } catch (error) {
            console.error('❌ Error enviando email de membresía activada:', error);
        }
    });

// Función para enviar notificación de renovación exitosa
exports.sendRenewalSuccessEmail = functions.firestore
    .document('payments/{paymentId}')
    .onCreate(async (snap, context) => {
        try {
            const payment = snap.data();
            
            if (payment.type === 'renewal' && payment.status === 'completed') {
                const userDoc = await db.collection('users').doc(payment.userId).get();
                const userData = userDoc.data();
                
                console.log(`📧 Enviando email de renovación exitosa para usuario: ${payment.userId}`);
                
                await sendEmail({
                    to: userData.email,
                    subject: 'Renovación de suscripción AXYRA exitosa',
                    template: 'renewal_success',
                    data: {
                        userName: userData.displayName || userData.email,
                        planName: getPlanName(payment.plan),
                        amount: formatPrice(payment.amount),
                        nextRenewal: calculateNextRenewalDate().toLocaleDateString('es-CO')
                    }
                });
            }
        } catch (error) {
            console.error('❌ Error enviando email de renovación exitosa:', error);
        }
    });

// Función para enviar notificación de pago fallido
exports.sendPaymentFailedEmail = functions.firestore
    .document('users/{userId}')
    .onUpdate(async (change, context) => {
        try {
            const before = change.before.data();
            const after = change.after.data();
            
            // Verificar si el pago falló
            if (before.membership?.status !== 'payment_failed' && after.membership?.status === 'payment_failed') {
                const userId = context.params.userId;
                const userData = after;
                const membership = after.membership;
                
                console.log(`📧 Enviando email de pago fallido para usuario: ${userId}`);
                
                await sendEmail({
                    to: userData.email,
                    subject: 'Error en el pago de tu suscripción AXYRA',
                    template: 'payment_failed',
                    data: {
                        userName: userData.displayName || userData.email,
                        planName: getPlanName(membership.plan),
                        failureReason: membership.failureReason || 'Error desconocido',
                        retryUrl: `https://axyra.vercel.app/renovar?user=${userId}`
                    }
                });
            }
        } catch (error) {
            console.error('❌ Error enviando email de pago fallido:', error);
        }
    });

// Función para enviar recordatorio de vencimiento
exports.sendExpiryReminder = functions.pubsub.schedule('0 9 * * *').onRun(async (context) => {
    try {
        console.log('📧 Enviando recordatorios de vencimiento...');
        
        const today = new Date();
        const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
        
        // Buscar membresías que vencen en 3 días
        const expiringMemberships = await db.collection('users')
            .where('membership.endDate', '<=', threeDaysFromNow)
            .where('membership.endDate', '>', today)
            .where('membership.status', '==', 'active')
            .get();

        console.log(`📊 Encontradas ${expiringMemberships.size} membresías próximas a vencer`);

        for (const doc of expiringMemberships.docs) {
            const userData = doc.data();
            const membership = userData.membership;
            
            const daysUntilExpiry = Math.ceil((membership.endDate.toDate() - today) / (1000 * 60 * 60 * 24));
            
            await sendEmail({
                to: userData.email,
                subject: `Tu suscripción AXYRA vence en ${daysUntilExpiry} días`,
                template: 'expiry_reminder',
                data: {
                    userName: userData.displayName || userData.email,
                    planName: getPlanName(membership.plan),
                    daysUntilExpiry: daysUntilExpiry,
                    expiryDate: membership.endDate.toDate().toLocaleDateString('es-CO'),
                    renewalUrl: `https://axyra.vercel.app/renovar?user=${doc.id}`
                }
            });
        }

        console.log('✅ Recordatorios de vencimiento enviados');
        return null;
    } catch (error) {
        console.error('❌ Error enviando recordatorios de vencimiento:', error);
        return null;
    }
});

// Función para enviar email (integrar con servicio de email)
async function sendEmail({ to, subject, template, data }) {
    try {
        // Aquí integrarías con SendGrid, Mailgun, AWS SES, etc.
        // Por ahora, solo logueamos el email
        
        const emailContent = getEmailTemplate(template, data);
        
        console.log(`📧 Email enviado:`);
        console.log(`   Para: ${to}`);
        console.log(`   Asunto: ${subject}`);
        console.log(`   Plantilla: ${template}`);
        console.log(`   Datos:`, data);
        
        // En producción, aquí harías la llamada real al servicio de email
        // await sendGrid.send({
        //     to: to,
        //     from: 'noreply@axyra.com',
        //     subject: subject,
        //     html: emailContent.html,
        //     text: emailContent.text
        // });
        
        return { success: true };
    } catch (error) {
        console.error('❌ Error enviando email:', error);
        throw error;
    }
}

// Función para obtener plantillas de email
function getEmailTemplate(template, data) {
    const templates = {
        membership_activated: {
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Bienvenido a AXYRA</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                        .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #3b82f6; }
                        .button { background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>¡Bienvenido a AXYRA!</h1>
                            <p>Tu suscripción ${data.planName} ha sido activada</p>
                        </div>
                        <div class="content">
                            <p>Hola ${data.userName},</p>
                            <p>¡Excelente noticia! Tu suscripción a AXYRA ha sido activada exitosamente.</p>
                            
                            <h3>Detalles de tu suscripción:</h3>
                            <ul>
                                <li><strong>Plan:</strong> ${data.planName}</li>
                                <li><strong>Fecha de vencimiento:</strong> ${data.expiryDate}</li>
                                <li><strong>Estado:</strong> Activa</li>
                            </ul>
                            
                            <h3>Funcionalidades incluidas:</h3>
                            ${data.features.map(feature => `<div class="feature">${feature}</div>`).join('')}
                            
                            <p>Ahora puedes acceder a todas las funcionalidades de tu plan desde tu dashboard.</p>
                            
                            <a href="https://axyra.vercel.app/dashboard" class="button">Acceder al Dashboard</a>
                            
                            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                            <p>¡Gracias por elegir AXYRA!</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                ¡Bienvenido a AXYRA!
                
                Tu suscripción ${data.planName} ha sido activada.
                
                Detalles:
                - Plan: ${data.planName}
                - Fecha de vencimiento: ${data.expiryDate}
                - Estado: Activa
                
                Funcionalidades incluidas:
                ${data.features.map(feature => `- ${feature}`).join('\n')}
                
                Accede a tu dashboard: https://axyra.vercel.app/dashboard
                
                ¡Gracias por elegir AXYRA!
            `
        },
        renewal_success: {
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Renovación Exitosa - AXYRA</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>¡Renovación Exitosa!</h1>
                            <p>Tu suscripción AXYRA ha sido renovada</p>
                        </div>
                        <div class="content">
                            <p>Hola ${data.userName},</p>
                            <p>Tu suscripción ${data.planName} ha sido renovada exitosamente.</p>
                            
                            <h3>Detalles del pago:</h3>
                            <ul>
                                <li><strong>Plan:</strong> ${data.planName}</li>
                                <li><strong>Monto:</strong> ${data.amount}</li>
                                <li><strong>Próxima renovación:</strong> ${data.nextRenewal}</li>
                            </ul>
                            
                            <p>Tu acceso a AXYRA continúa sin interrupciones.</p>
                            
                            <a href="https://axyra.vercel.app/dashboard" class="button">Acceder al Dashboard</a>
                            
                            <p>¡Gracias por confiar en AXYRA!</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                ¡Renovación Exitosa!
                
                Tu suscripción ${data.planName} ha sido renovada exitosamente.
                
                Detalles del pago:
                - Plan: ${data.planName}
                - Monto: ${data.amount}
                - Próxima renovación: ${data.nextRenewal}
                
                Accede a tu dashboard: https://axyra.vercel.app/dashboard
                
                ¡Gracias por confiar en AXYRA!
            `
        },
        payment_failed: {
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Error en el Pago - AXYRA</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Error en el Pago</h1>
                            <p>No pudimos procesar tu pago</p>
                        </div>
                        <div class="content">
                            <p>Hola ${data.userName},</p>
                            <p>Lamentamos informarte que no pudimos procesar el pago de tu suscripción ${data.planName}.</p>
                            
                            <h3>Detalles del error:</h3>
                            <p><strong>Razón:</strong> ${data.failureReason}</p>
                            
                            <p>Por favor, verifica los datos de tu tarjeta y vuelve a intentar.</p>
                            
                            <a href="${data.retryUrl}" class="button">Reintentar Pago</a>
                            
                            <p>Si el problema persiste, contacta a nuestro equipo de soporte.</p>
                            <p>¡Gracias por tu paciencia!</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Error en el Pago
                
                No pudimos procesar el pago de tu suscripción ${data.planName}.
                
                Razón: ${data.failureReason}
                
                Por favor, verifica los datos de tu tarjeta y vuelve a intentar.
                
                Reintentar pago: ${data.retryUrl}
                
                Si el problema persiste, contacta a nuestro equipo de soporte.
                
                ¡Gracias por tu paciencia!
            `
        },
        expiry_reminder: {
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Recordatorio de Vencimiento - AXYRA</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Recordatorio de Vencimiento</h1>
                            <p>Tu suscripción vence en ${data.daysUntilExpiry} días</p>
                        </div>
                        <div class="content">
                            <p>Hola ${data.userName},</p>
                            <p>Te recordamos que tu suscripción ${data.planName} vence el ${data.expiryDate}.</p>
                            
                            <h3>Detalles:</h3>
                            <ul>
                                <li><strong>Plan:</strong> ${data.planName}</li>
                                <li><strong>Días restantes:</strong> ${data.daysUntilExpiry}</li>
                                <li><strong>Fecha de vencimiento:</strong> ${data.expiryDate}</li>
                            </ul>
                            
                            <p>Para continuar disfrutando de todas las funcionalidades de AXYRA, renueva tu suscripción ahora.</p>
                            
                            <a href="${data.renewalUrl}" class="button">Renovar Suscripción</a>
                            
                            <p>Si no renuevas, tu acceso se limitará al plan gratuito.</p>
                            <p>¡Gracias por usar AXYRA!</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Recordatorio de Vencimiento
                
                Tu suscripción ${data.planName} vence en ${data.daysUntilExpiry} días.
                
                Detalles:
                - Plan: ${data.planName}
                - Días restantes: ${data.daysUntilExpiry}
                - Fecha de vencimiento: ${data.expiryDate}
                
                Para continuar disfrutando de todas las funcionalidades de AXYRA, renueva tu suscripción ahora.
                
                Renovar suscripción: ${data.renewalUrl}
                
                Si no renuevas, tu acceso se limitará al plan gratuito.
                
                ¡Gracias por usar AXYRA!
            `
        }
    };
    
    return templates[template] || { html: '', text: '' };
}

// Funciones auxiliares
function getPlanName(planId) {
    const planNames = {
        'free': 'Gratis',
        'basic': 'Básico',
        'professional': 'Profesional',
        'enterprise': 'Empresarial'
    };
    return planNames[planId] || 'Desconocido';
}

function getPlanFeatures(planId) {
    const features = {
        'basic': ['Hasta 25 empleados', 'Reportes básicos', 'Soporte por email', 'Dashboard completo'],
        'professional': ['Empleados ilimitados', 'Reportes avanzados', 'Soporte prioritario', 'Todas las funcionalidades'],
        'enterprise': ['Todo lo anterior', 'Múltiples sucursales', 'Integración personalizada', 'Soporte dedicado']
    };
    return features[planId] || [];
}

function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(price);
}

function calculateNextRenewalDate() {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
}
