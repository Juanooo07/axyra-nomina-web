import React, { useState } from 'react';

export function LegalPages() {
  const [currentPage, setCurrentPage] = useState<'home' | 'privacy' | 'terms'>('home');

  if (currentPage === 'privacy') {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setCurrentPage('home')}
            className="text-blue-600 hover:underline mb-4"
          >
            ← Volver
          </button>
          <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>
          <div className="prose prose-lg">
            <h2>Última actualización: 24 de enero de 2026</h2>

            <h3>1. Información que Recopilamos</h3>
            <p>AXYRA recopila la siguiente información:</p>
            <ul>
              <li><strong>Información de cuenta:</strong> Nombre, email, organización</li>
              <li><strong>Datos de empleados:</strong> Nombres, cédulas, información salarial</li>
              <li><strong>Registros de horas:</strong> Horas trabajadas, tipos de horas</li>
              <li><strong>Información de nómina:</strong> Cálculos de salarios, deducciones</li>
            </ul>

            <h3>2. Cómo Usamos la Información</h3>
            <p>Utilizamos esta información para:</p>
            <ul>
              <li>Generar nóminas y recibos de pago</li>
              <li>Registrar horas de trabajo</li>
              <li>Exportar datos a Google Drive para almacenamiento seguro</li>
              <li>Proporcionar reportes de recursos humanos</li>
            </ul>

            <h3>3. Acceso a Google Drive</h3>
            <p>Cuando autorizas AXYRA para acceder a Google Drive:</p>
            <ul>
              <li>Solo podemos <strong>crear y subir archivos</strong> en una carpeta específica</li>
              <li><strong>NO podemos</strong> leer, modificar o eliminar otros archivos</li>
              <li><strong>NO compartimos</strong> tu información con terceros</li>
              <li>Puedes <strong>revocar el acceso</strong> en cualquier momento desde tu cuenta de Google</li>
            </ul>

            <h3>4. Seguridad de Datos</h3>
            <ul>
              <li>Todos los datos se almacenan en <strong>Supabase</strong> (base de datos PostgreSQL encriptada)</li>
              <li>Las contraseñas se encriptan con <strong>Supabase Auth</strong></li>
              <li>Los tokens de Google se encriptan y almacenan de forma segura</li>
              <li>Usamos <strong>HTTPS</strong> para todas las comunicaciones</li>
            </ul>

            <h3>5. Derechos del Usuario</h3>
            <p>Tienes derecho a:</p>
            <ul>
              <li><strong>Acceder</strong> a tus datos en cualquier momento</li>
              <li><strong>Modificar</strong> tu información</li>
              <li><strong>Eliminar</strong> tu cuenta y todos tus datos</li>
              <li><strong>Revocar</strong> el acceso a Google Drive</li>
            </ul>

            <h3>6. Contacto</h3>
            <p>Para preguntas sobre privacidad, contacta a: <strong>juanfernando10gamer@gmail.com</strong></p>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'terms') {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setCurrentPage('home')}
            className="text-blue-600 hover:underline mb-4"
          >
            ← Volver
          </button>
          <h1 className="text-4xl font-bold mb-8">Términos y Condiciones de Servicio</h1>
          <div className="prose prose-lg">
            <h2>Última actualización: 24 de enero de 2026</h2>

            <h3>1. Aceptación de Términos</h3>
            <p>Al usar AXYRA, aceptas estos términos y condiciones. Si no estás de acuerdo, no uses la aplicación.</p>

            <h3>2. Descripción del Servicio</h3>
            <p>AXYRA es una plataforma para:</p>
            <ul>
              <li>Gestionar registros de horas de trabajo</li>
              <li>Calcular nóminas y salarios</li>
              <li>Generar reportes de recursos humanos</li>
              <li>Exportar datos a Google Drive</li>
            </ul>

            <h3>3. Acceso y Cuenta</h3>
            <ul>
              <li>Debes tener una <strong>cuenta válida de email</strong></li>
              <li>Eres responsable de mantener tu <strong>contraseña confidencial</strong></li>
              <li>No compartirás tu cuenta con otras personas</li>
              <li>AXYRA se reserva el derecho de <strong>suspender cuentas</strong> que violen estos términos</li>
            </ul>

            <h3>4. Uso Aceptable</h3>
            <p><strong>Está PROHIBIDO:</strong></p>
            <ul>
              <li>Usar datos de otros usuarios sin autorización</li>
              <li>Intentar acceder a áreas restringidas de la aplicación</li>
              <li>Descargar o exportar grandes volúmenes de datos para reventa</li>
              <li>Usar la aplicación para fines ilegales</li>
            </ul>

            <h3>5. Integración con Google Drive</h3>
            <ul>
              <li>AXYRA solo puede <strong>crear archivos</strong> en tu Google Drive</li>
              <li>Solo necesita acceso a la carpeta específica "AXYRA - Nóminas"</li>
              <li>Puedes <strong>revocar acceso</strong> en cualquier momento desde Google</li>
            </ul>

            <h3>6. Limitaciones de Responsabilidad</h3>
            <p>AXYRA se proporciona "tal cual". No garantizamos:</p>
            <ul>
              <li>Disponibilidad 100% del servicio</li>
              <li>Que los datos no se pierdan</li>
              <li>Que la aplicación sea perfecta sin errores</li>
            </ul>

            <h3>7. Cambios en Términos</h3>
            <p>AXYRA puede actualizar estos términos en cualquier momento. El uso continuado significa aceptación.</p>

            <h3>8. Contacto</h3>
            <p>Para preguntas: <strong>juanfernando10gamer@gmail.com</strong></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">Información Legal</h1>
        <div className="space-y-4">
          <button
            onClick={() => setCurrentPage('privacy')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Leer Política de Privacidad
          </button>
          <button
            onClick={() => setCurrentPage('terms')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Leer Términos y Condiciones
          </button>
        </div>
      </div>
    </div>
  );
}
