import { Building2, Users, Clock, DollarSign, BarChart3, Shield, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 animate-fadeInLeft">
              <img src="/nomina.png" alt="AXYRA Logo" className="h-12 animate-float" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                AXYRA
              </span>
            </div>
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl animate-fadeInRight"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6 animate-fadeInDown">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Sistema de Nómina Profesional</span>
          </div>
          <h1 className="text-6xl font-bold text-slate-900 mb-6 animate-fadeInUp">
            Gestión de Nómina{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Simplificada
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto animate-fadeInUp animation-delay-200">
            AXYRA es la solución completa para administrar múltiples empresas, empleados,
            registros de horas y nóminas en una sola plataforma moderna y segura.
          </p>
          <div className="flex justify-center gap-4 animate-fadeInUp animation-delay-400">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 font-semibold text-lg shadow-xl hover:shadow-2xl flex items-center space-x-2"
            >
              <span>Comenzar ahora</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-16 animate-fadeInUp">
          Características principales
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-slate-100 transform hover:scale-105 animate-fadeInUp">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Multi-empresa
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Gestiona múltiples empresas desde una sola cuenta con roles y permisos personalizados para cada organización.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-slate-100 transform hover:scale-105 animate-fadeInUp animation-delay-200">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Gestión de Empleados
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Administra la información completa de tus empleados, contratos y datos laborales de forma centralizada.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-slate-100 transform hover:scale-105 animate-fadeInUp animation-delay-400">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Control de Horas
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Registra y categoriza las horas trabajadas con tipos de hora personalizables y reportes detallados.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-slate-100 transform hover:scale-105 animate-fadeInUp animation-delay-600">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Cálculo de Nómina
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Calcula automáticamente salarios, horas extras y deducciones con precisión y cumplimiento normativo.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-slate-100 transform hover:scale-105 animate-fadeInUp animation-delay-800">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Reportes y Análisis
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Visualiza métricas clave y genera reportes detallados para la toma de decisiones estratégicas.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-slate-100 transform hover:scale-105 animate-fadeInUp">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Seguridad Garantizada
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Protección de datos con autenticación segura y control de acceso basado en roles y permisos.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-600 to-blue-800 border-y border-blue-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-white mb-16 animate-fadeInUp">
            ¿Para quién es AXYRA?
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all animate-fadeInUp">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Building2 className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Pequeñas Empresas
              </h3>
              <p className="text-blue-100 leading-relaxed">
                Simplifica la gestión de nómina sin necesidad de software complejo o costoso. Todo en una sola plataforma.
              </p>
            </div>

            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all animate-fadeInUp animation-delay-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Departamentos de RRHH
              </h3>
              <p className="text-blue-100 leading-relaxed">
                Centraliza toda la información laboral y agiliza los procesos de nómina con herramientas profesionales.
              </p>
            </div>

            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all animate-fadeInUp animation-delay-400">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <BarChart3 className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Gestores Multi-empresa
              </h3>
              <p className="text-blue-100 leading-relaxed">
                Administra la nómina de múltiples empresas desde una única plataforma con total control y visibilidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl shadow-2xl p-12 border border-slate-200 animate-fadeInScale">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Comienza a gestionar tu nómina hoy
          </h2>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed">
            Únete a empresas que ya confían en AXYRA para su gestión de recursos humanos y nómina.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div className="flex items-center space-x-2 text-slate-700">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Configuración rápida</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Soporte incluido</span>
            </div>
          </div>
          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-12 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 font-semibold text-lg shadow-xl hover:shadow-2xl flex items-center space-x-2 mx-auto"
          >
            <span>Crear cuenta gratis</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img src="/nomina.png" alt="AXYRA Logo" className="h-10" />
              <span className="text-2xl font-bold">AXYRA</span>
            </div>
            <p className="text-slate-400 mb-4">
              Sistema profesional de gestión de nómina empresarial
            </p>
            <p className="text-slate-500 text-sm">
              © 2026 AXYRA. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
