/**
 * 🔒 MIDDLEWARE DE CORS SEGURO
 * Solo permite dominios de confianza (whitelist)
 * Previene ataques desde sitios maliciosos
 */

const ALLOWED_ORIGINS = [
  'https://axyra.vercel.app',
  'https://axyra-sistema-gestion.vercel.app',
  'https://axyra-sistema-gestion-axyras-projects.vercel.app',
  'http://localhost:3000', // Solo desarrollo local
  'http://localhost:5000',
];

/**
 * Aplicar CORS seguro a una respuesta
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
function secureCorsFn(req, res) {
  const origin = req.headers.origin;

  // ✅ Solo permitir orígenes en whitelist
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    // Log de intento de acceso no autorizado
    console.warn(`⚠️  CORS bloqueado - Origen no permitido: ${origin}`);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
}

module.exports = secureCorsFn;
