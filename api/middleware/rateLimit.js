/**
 * 🛡️ RATE LIMITING PARA PROTEGER APIs
 * Previene:
 * - Brute force attacks
 * - DDoS attacks
 * - API abuse/spam
 */

// Store simple en memoria (para producción usar Redis)
const requestCounts = new Map();

/**
 * Rate limiter middleware
 * @param {number} maxRequests - Máximo de requests permitidos
 * @param {number} windowMs - Ventana de tiempo en milisegundos
 * @param {string} message - Mensaje de error cuando se excede el límite
 */
function createRateLimiter(maxRequests = 100, windowMs = 15 * 60 * 1000) {
  return function rateLimiter(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Limpiar registros antiguos
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, []);
    }

    let requests = requestCounts.get(ip);
    requests = requests.filter(time => time > windowStart);
    requestCounts.set(ip, requests);

    // Verificar si se excedió el límite
    if (requests.length >= maxRequests) {
      console.warn(`⚠️  Rate limit excedido para IP: ${ip} (${requests.length}/${maxRequests})`);
      return res.status(429).json({
        error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Registrar este request
    requests.push(now);
    requestCounts.set(ip, requests);

    // Continuar
    if (next) next();
  };
}

// Rate limiters predefinidos
const rateLimiters = {
  // Muy estricto - para endpoints de pago
  payment: createRateLimiter(5, 15 * 60 * 1000), // 5 requests / 15 minutos
  
  // Moderado - para APIs generales
  api: createRateLimiter(100, 15 * 60 * 1000), // 100 requests / 15 minutos
  
  // Estricto - para login
  login: createRateLimiter(5, 15 * 60 * 1000), // 5 intentos / 15 minutos
  
  // Webhook - moderado
  webhook: createRateLimiter(50, 1 * 60 * 1000), // 50 requests / 1 minuto
};

module.exports = {
  createRateLimiter,
  ...rateLimiters,
};
