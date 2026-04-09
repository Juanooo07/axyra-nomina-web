// Webhook para procesar pagos de PayPal
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event_type, resource } = req.body;

    // Verificar la firma del webhook
    const signature = req.headers['paypal-transmission-id'];
    const certId = req.headers['paypal-cert-id'];
    const authAlgo = req.headers['paypal-auth-algo'];
    const transmissionSig = req.headers['paypal-transmission-sig'];
    const transmissionTime = req.headers['paypal-transmission-time'];

    // Aquí deberías verificar la firma con PayPal
    // Por ahora, procesamos directamente

    // Procesar el evento
    switch (event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await processPaymentCompleted(resource);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        await processPaymentDenied(resource);
        break;
      case 'PAYMENT.CAPTURE.REFUNDED':
        await processPaymentRefunded(resource);
        break;
      default:
        console.log('Evento PayPal no manejado:', event_type);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error procesando webhook de PayPal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function processPaymentCompleted(data) {
  // Lógica para pago completado
  console.log('Pago completado:', data);
}

async function processPaymentDenied(data) {
  // Lógica para pago denegado
  console.log('Pago denegado:', data);
}

async function processPaymentRefunded(data) {
  // Lógica para reembolso
  console.log('Reembolso procesado:', data);
}









