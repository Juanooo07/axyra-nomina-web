/**
 * 🤖 SISTEMA DE CHAT CON IA MEJORADO - AXYRA
 * Burbuja flotante funcional con animaciones brutales
 */

class AIChatSystem {
    constructor() {
        this.isOpen = false;
        this.isMinimized = false;
        this.messages = [];
        this.context = {
            currentModule: this.detectCurrentModule(),
            userRole: 'admin',
            companyId: null,
            sessionId: this.generateSessionId()
        };
        
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.init();
    }

    init() {
        // Verificar si el usuario tiene acceso al chat IA
        if (!this.hasAccessToAIChat()) {
            console.log('🚫 Usuario no tiene acceso al chat IA (plan básico/gratuito)');
            return;
        }
        
        this.createChatInterface();
        this.setupEventListeners();
        this.loadChatHistory();
        console.log('🤖 Sistema de Chat IA inicializado');
    }

    hasAccessToAIChat() {
        // Verificar plan del usuario
        if (window.axyraMembershipSystem && window.axyraMembershipSystem.currentMembership) {
            const plan = window.axyraMembershipSystem.currentMembership.id;
            // Solo planes professional y enterprise tienen acceso al chat IA
            return plan === 'professional' || plan === 'enterprise';
        }
        
        // Si no hay sistema de membresías, permitir acceso (modo desarrollo)
        return true;
    }

    detectCurrentModule() {
        const path = window.location.pathname;
        if (path.includes('gestion_personal')) return 'gestion_personal';
        if (path.includes('cuadre_caja')) return 'cuadre_caja';
        if (path.includes('inventario')) return 'inventario';
        if (path.includes('configuracion')) return 'configuracion';
        if (path.includes('dashboard')) return 'dashboard';
        return 'general';
    }

    createChatInterface() {
        // Solo crear si no existe
        if (document.getElementById('ai-chat-container')) {
            console.log('Chat IA ya existe, saltando creación');
            return;
        }

        const chatHTML = `
            <div class="ai-chat-container" id="ai-chat-container">
                <!-- Burbuja flotante -->
                <div class="ai-chat-bubble" id="ai-chat-bubble">
                    <div class="bubble-content">
                        <i class="fas fa-robot"></i>
                        <span class="bubble-text">AXYRA Assistant</span>
                    </div>
                    <div class="bubble-pulse"></div>
                </div>

                <!-- Ventana de chat -->
                <div class="ai-chat-window" id="ai-chat-window">
                    <div class="ai-chat-header">
                        <div class="ai-chat-title">
                            <div class="ai-avatar">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="ai-info">
                                <h3>AXYRA Assistant</h3>
                                <span class="ai-status">En línea</span>
                            </div>
                        </div>
                        <div class="ai-chat-controls">
                            <button class="ai-chat-minimize" id="ai-chat-minimize">
                                <i class="fas fa-minus"></i>
                            </button>
                            <button class="ai-chat-close" id="ai-chat-close">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <div class="ai-chat-messages" id="ai-chat-messages">
                        <div class="ai-chat-message ai welcome-message">
                            <div class="message-content">
                                <strong>¡Hola! Soy AXYRA Assistant</strong><br>
                                Tu asistente inteligente. Puedo ayudarte con:
                                <ul>
                                    <li>Gestión de personal y nómina</li>
                                    <li>Control de inventario</li>
                                    <li>Cuadre de caja</li>
                                    <li>Configuración del sistema</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="ai-chat-typing-indicator" id="ai-chat-typing">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <div class="ai-chat-input-area">
                        <input type="text" id="ai-chat-input" placeholder="Escribe tu pregunta aquí...">
                        <button id="ai-chat-send">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>

                    <div class="quick-suggestions">
                        <button class="suggestion-btn" data-suggestion="¿Cómo registro horas?">+ Agregar empleado</button>
                        <button class="suggestion-btn" data-suggestion="¿Cómo calculo nómina?">Cuadre de caja</button>
                        <button class="suggestion-btn" data-suggestion="¿Cómo agrego empleado?">Inventario</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
        this.setupEventListeners();
    }

    setupEventListeners() {
        const bubble = document.getElementById('ai-chat-bubble');
        const window = document.getElementById('ai-chat-window');
        const closeBtn = document.getElementById('ai-chat-close');
        const minimizeBtn = document.getElementById('ai-chat-minimize');
        const sendBtn = document.getElementById('ai-chat-send');
        const input = document.getElementById('ai-chat-input');
        const suggestionBtns = document.querySelectorAll('.suggestion-btn');

        // Burbuja flotante
        if (bubble) {
            bubble.addEventListener('click', () => {
                this.toggleChat();
            });
        }

        // Botones de control
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeChat();
            });
        }

        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                this.minimizeChat();
            });
        }

        // Envío de mensajes
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // Sugerencias rápidas
        suggestionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const suggestion = btn.dataset.suggestion;
                if (input) {
                    input.value = suggestion;
                    this.sendMessage();
                }
            });
        });

        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#ai-chat-container') && this.isOpen) {
                this.minimizeChat();
            }
        });
    }

    toggleChat() {
        if (this.isOpen) {
            this.minimizeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        const window = document.getElementById('ai-chat-window');
        const bubble = document.getElementById('ai-chat-bubble');
        
        if (window && bubble) {
            this.isOpen = true;
            this.isMinimized = false;
            
            window.classList.add('active');
            bubble.classList.add('hidden');
            
            // Enfocar input
            const input = document.getElementById('ai-chat-input');
            if (input) {
                setTimeout(() => input.focus(), 300);
            }
            
            console.log('🤖 Chat IA abierto');
        }
    }

    minimizeChat() {
        const window = document.getElementById('ai-chat-window');
        const bubble = document.getElementById('ai-chat-bubble');
        
        if (window && bubble) {
            this.isOpen = false;
            this.isMinimized = true;
            
            window.classList.remove('active');
            bubble.classList.remove('hidden');
            
            console.log('🤖 Chat IA minimizado');
        }
    }

    closeChat() {
        const window = document.getElementById('ai-chat-window');
        const bubble = document.getElementById('ai-chat-bubble');
        
        if (window && bubble) {
            this.isOpen = false;
            this.isMinimized = false;
            
            window.classList.remove('active');
            bubble.classList.remove('hidden');
            
            console.log('🤖 Chat IA cerrado');
        }
    }

    sendMessage() {
        const input = document.getElementById('ai-chat-input');
        const messages = document.getElementById('ai-chat-messages');
        const message = input?.value.trim();

        if (!message) return;

        // Agregar mensaje del usuario
        this.addMessage(message, 'user');
        
        // Limpiar input
        if (input) input.value = '';

        // Mostrar indicador de escritura
        this.showTypingIndicator();

        // Simular respuesta de IA
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateResponse(message);
            this.addMessage(response, 'ai');
        }, 1500);
    }

    addMessage(content, type) {
        const messages = document.getElementById('ai-chat-messages');
        if (!messages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-chat-message ${type}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content;
        
        messageDiv.appendChild(contentDiv);
        messages.appendChild(messageDiv);

        // Scroll al final
        messages.scrollTop = messages.scrollHeight;
    }

    showTypingIndicator() {
        const indicator = document.getElementById('ai-chat-typing');
        if (indicator) {
            indicator.classList.add('active');
        }
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('ai-chat-typing');
        if (indicator) {
            indicator.classList.remove('active');
        }
    }

    generateResponse(message) {
        const responses = {
            'horas': 'Para registrar horas:<br>1. Selecciona el empleado<br>2. Elige la fecha<br>3. Ingresa las horas trabajadas<br>4. Haz clic en "Registrar Horas"',
            'nomina': 'Para calcular nómina:<br>1. Ve a la pestaña "Nómina"<br>2. Selecciona el empleado<br>3. Elige el período<br>4. Haz clic en "Generar Nómina"',
            'empleado': 'Para agregar empleado:<br>1. Ve a la pestaña "Empleados"<br>2. Haz clic en "Agregar Empleado"<br>3. Completa los datos<br>4. Guarda la información',
            'caja': 'Para cuadre de caja:<br>1. Ve al módulo "Caja"<br>2. Registra movimientos<br>3. Calcula el cuadre<br>4. Genera reporte',
            'inventario': 'Para gestionar inventario:<br>1. Ve al módulo "Inventario"<br>2. Agrega productos<br>3. Actualiza stock<br>4. Genera reportes'
        };

        const lowerMessage = message.toLowerCase();
        
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }

        return 'Entiendo tu consulta. Te puedo ayudar con:<br>• Gestión de empleados<br>• Registro de horas<br>• Cálculo de nóminas<br>• Cuadre de caja<br>• Control de inventario<br><br>¿En qué más puedo ayudarte?';
    }

    loadChatHistory() {
        // Cargar historial desde localStorage
        const stored = localStorage.getItem('axyra_chat_history');
        if (stored) {
            this.messages = JSON.parse(stored);
        }
    }

    saveChatHistory() {
        localStorage.setItem('axyra_chat_history', JSON.stringify(this.messages));
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    initializeKnowledgeBase() {
        return {
            modules: ['gestion_personal', 'cuadre_caja', 'inventario', 'configuracion'],
            commonQuestions: [
                '¿Cómo registro horas?',
                '¿Cómo calculo nómina?',
                '¿Cómo agrego empleado?',
                '¿Cómo hago cuadre de caja?',
                '¿Cómo gestiono inventario?'
            ]
        };
    }
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si no existe
    if (!document.getElementById('ai-chat-container')) {
        window.aiChatSystem = new AIChatSystem();
    }
});

// Exportar para uso global
window.AIChatSystem = AIChatSystem;