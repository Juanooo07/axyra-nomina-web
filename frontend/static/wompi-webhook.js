/**
 * AXYRA - Webhook Handler para Wompi
 * Maneja notificaciones de pago de Wompi
 */

class AxyraWompiWebhook {
  constructor() {
    this.config = {
      wompiEventsSecret: 'prod_events_4ob12JL0RXAolocztVa9GThpUrGfy8Dn'
    };
    
    this.planMapping = {
      'dJSIja': 'basic',      // Plan Básico
      'Lk65dP': 'professional', // Plan Profesional  
      'Hg5RaQ': 'enterprise'   // Plan Empresarial
    };
  }

  /**
   * Procesa un webhook de Wompi
   */
  async processWebhook(webhookData) {
    try {
      console.log('🔔 Webhook de Wompi recibido:', webhookData);

      // Verificar la firma del webhook (opcional pero recomendado)
      if (!this.verifyWebhookSignature(webhookData)) {
        console.error('❌ Firma de webhook inválida');
        return { success: false, error: 'Invalid signature' };
      }

      const { event, data } = webhookData;

      if (event === 'transaction.updated' && data.status === 'APPROVED') {
        console.log('✅ Pago aprobado:', data);
        await this.handleApprovedPayment(data);
      } else if (event === 'transaction.updated' && data.status === 'DECLINED') {
        console.log('❌ Pago rechazado:', data);
        await this.handleDeclinedPayment(data);
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Error procesando webhook:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verifica la firma del webhook
   */
  verifyWebhookSignature(webhookData) {
    // Implementar verificación de firma si es necesario
    // Por ahora retornamos true para simplificar
    return true;
  }

  /**
   * Maneja un pago aprobado
   */
  async handleApprovedPayment(transactionData) {
    try {
      console.log('🎉 Procesando pago aprobado...');

      // Determinar el plan basado en la referencia o link
      const plan = this.determinePlanFromTransaction(transactionData);
      if (!plan) {
        console.error('❌ No se pudo determinar el plan');
        return;
      }

      // Obtener información del usuario
      const userId = this.getUserIdFromTransaction(transactionData);
      if (!userId) {
        console.error('❌ No se pudo obtener el ID del usuario');
        return;
      }

      // Actualizar membresía
      await this.updateUserMembership(userId, plan, transactionData);

      console.log('✅ Membresía actualizada correctamente');
    } catch (error) {
      console.error('❌ Error actualizando membresía:', error);
    }
  }

  /**
   * Maneja un pago rechazado
   */
  async handleDeclinedPayment(transactionData) {
    try {
      console.log('❌ Procesando pago rechazado...');
      
      // Registrar el pago rechazado
      await firebase.firestore().collection('failed_payments').add({
        transactionId: transactionData.id,
        reference: transactionData.reference,
        amount: transactionData.amount_in_cents,
        currency: transactionData.currency,
        status: 'declined',
        reason: transactionData.status_message,
        timestamp: new Date()
      });

      console.log('✅ Pago rechazado registrado');
    } catch (error) {
      console.error('❌ Error registrando pago rechazado:', error);
    }
  }

  /**
   * Determina el plan basado en la transacción
   */
  determinePlanFromTransaction(transactionData) {
    // Buscar en la referencia o en el link de pago
    const reference = transactionData.reference || '';
    const paymentLink = transactionData.payment_link_id || '';

    // Mapear por ID de link de pago
    for (const [linkId, plan] of Object.entries(this.planMapping)) {
      if (paymentLink.includes(linkId)) {
        return plan;
      }
    }

    // Mapear por referencia
    if (reference.includes('BASIC')) return 'basic';
    if (reference.includes('PROFESSIONAL')) return 'professional';
    if (reference.includes('ENTERPRISE')) return 'enterprise';

    return null;
  }

  /**
   * Obtiene el ID del usuario de la transacción
   */
  getUserIdFromTransaction(transactionData) {
    // Buscar en la referencia o en datos adicionales
    const reference = transactionData.reference || '';
    const match = reference.match(/USER_([a-zA-Z0-9]+)/);
    
    if (match) {
      return match[1];
    }

    // Si no se encuentra en la referencia, buscar en la base de datos
    // por email del cliente
    if (transactionData.customer_email) {
      return this.findUserByEmail(transactionData.customer_email);
    }

    return null;
  }

  /**
   * Busca usuario por email
   */
  async findUserByEmail(email) {
    try {
      const usersRef = firebase.firestore().collection('users');
      const querySnapshot = await usersRef.where('email', '==', email).get();
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error buscando usuario por email:', error);
      return null;
    }
  }

  /**
   * Actualiza la membresía del usuario
   */
  async updateUserMembership(userId, plan, transactionData) {
    try {
      console.log('📝 Actualizando membresía:', { userId, plan });

      const membershipData = {
        plan: plan,
        status: 'active',
        startDate: new Date(),
        endDate: this.calculateEndDate(plan),
        paymentMethod: 'wompi',
        transactionId: transactionData.id,
        lastUpdated: new Date()
      };

      // Actualizar documento del usuario
      await firebase.firestore().collection('users').doc(userId).update({
        membership: membershipData,
        lastUpdated: new Date()
      });

      // Crear registro de pago
      await firebase.firestore().collection('payments').add({
        userId: userId,
        plan: plan,
        amount: transactionData.amount_in_cents / 100, // Convertir de centavos
        currency: transactionData.currency,
        status: 'completed',
        paymentMethod: 'wompi',
        transactionId: transactionData.id,
        reference: transactionData.reference,
        timestamp: new Date()
      });

      console.log('✅ Membresía actualizada correctamente');
    } catch (error) {
      console.error('❌ Error actualizando membresía:', error);
      throw error;
    }
  }

  /**
   * Calcula la fecha de vencimiento
   */
  calculateEndDate(plan) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    return endDate;
  }
}

// Exportar para uso en otros archivos
window.AxyraWompiWebhook = AxyraWompiWebhook;
