// Webhook para procesar pagos de Wompi
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event, data } = req.body;

    // Verificar la firma del webhook
    const signature = req.headers['x-wompi-signature'];
    const expectedSignature = crypto
      .createHmac('sha256', process.env.WOMPI_EVENTS_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Procesar el evento
    switch (event) {
      case 'transaction.updated':
        await processTransactionUpdate(data);
        break;
      case 'transaction.created':
        await processTransactionCreated(data);
        break;
      default:
        console.log('Evento no manejado:', event);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error procesando webhook de Wompi:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function processTransactionUpdate(data) {
  // Lógica para actualizar transacción
  console.log('Actualizando transacción:', data);
}

async function processTransactionCreated(data) {
  // Lógica para nueva transacción
  console.log('Nueva transacción creada:', data);
}









