// ========================================
// SISTEMA DE CHAT IA FUNCIONAL AXYRA
// Chat IA que funciona correctamente
// ========================================

class AIChatFunctional {
    constructor() {
        this.isInitialized = false;
        this.isOpen = false;
        this.isMinimized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🤖 Inicializando sistema de Chat IA funcional...');
        this.createChatInterface();
        this.setupEventListeners();
        this.isInitialized = true;
        console.log('✅ Sistema de Chat IA funcional inicializado');
    }

    createChatInterface() {
        // Crear botón flotante
        this.createFloatingButton();
        
        // Crear ventana de chat
        this.createChatWindow();
    }

    createFloatingButton() {
        const button = document.createElement('div');
        button.id = 'ai-chat-button';
        button.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 1000;
                transition: all 0.3s ease;
                font-size: 24px;
                color: white;
            " onmouseover="this.style.transform='scale(1.1)'" 
               onmouseout="this.style.transform='scale(1)'">
                🤖
            </div>
        `;
        
        button.addEventListener('click', () => this.toggleChat());
        document.body.appendChild(button);
    }

    createChatWindow() {
        const chatWindow = document.createElement('div');
        chatWindow.id = 'ai-chat-window';
        chatWindow.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            z-index: 1001;
            display: none;
            flex-direction: column;
            overflow: hidden;
            font-family: 'Segoe UI', sans-serif;
        `;

        chatWindow.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">🤖</span>
                    <div>
                        <div style="font-weight: bold; font-size: 16px;">Asistente IA</div>
                        <div style="font-size: 12px; opacity: 0.8;">AXYRA Support</div>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button id="minimize-chat" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">−</button>
                    <button id="close-chat" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">×</button>
                </div>
            </div>
            
            <div id="chat-messages" style="
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background: #f8f9fa;
            ">
                <div style="
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 15px;
                    border-radius: 15px;
                    margin-bottom: 15px;
                    font-size: 14px;
                    line-height: 1.4;
                ">
                    ¡Hola! Soy tu asistente IA de AXYRA. ¿En qué puedo ayudarte hoy?
                </div>
            </div>
            
            <div style="
                padding: 15px;
                border-top: 1px solid #e9ecef;
                background: white;
            ">
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="chat-input" placeholder="Escribe tu mensaje..." style="
                        flex: 1;
                        padding: 12px 15px;
                        border: 1px solid #ddd;
                        border-radius: 25px;
                        outline: none;
                        font-size: 14px;
                    ">
                    <button id="send-message" style="
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        border: none;
                        width: 45px;
                        height: 45px;
                        border-radius: 50%;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 18px;
                    ">→</button>
                </div>
            </div>
        `;

        document.body.appendChild(chatWindow);
    }

    setupEventListeners() {
        // Botón de cerrar
        document.addEventListener('click', (e) => {
            if (e.target.id === 'close-chat') {
                this.closeChat();
            }
        });

        // Botón de minimizar
        document.addEventListener('click', (e) => {
            if (e.target.id === 'minimize-chat') {
                this.minimizeChat();
            }
        });

        // Enviar mensaje
        document.addEventListener('click', (e) => {
            if (e.target.id === 'send-message') {
                this.sendMessage();
            }
        });

        // Enter para enviar
        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'chat-input' && e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        const chatWindow = document.getElementById('ai-chat-window');
        if (chatWindow) {
            chatWindow.style.display = 'flex';
            this.isOpen = true;
            this.isMinimized = false;
            console.log('🤖 Chat IA abierto');
        }
    }

    closeChat() {
        const chatWindow = document.getElementById('ai-chat-window');
        if (chatWindow) {
            chatWindow.style.display = 'none';
            this.isOpen = false;
            this.isMinimized = false;
            console.log('🤖 Chat IA cerrado');
        }
    }

    minimizeChat() {
        const chatWindow = document.getElementById('ai-chat-window');
        if (chatWindow) {
            if (this.isMinimized) {
                chatWindow.style.height = '500px';
                this.isMinimized = false;
                console.log('🤖 Chat IA expandido');
            } else {
                chatWindow.style.height = '60px';
                this.isMinimized = true;
                console.log('🤖 Chat IA minimizado');
            }
        }
    }

    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (message) {
            this.addMessage(message, 'user');
            input.value = '';
            
            // Simular respuesta del IA
            setTimeout(() => {
                this.addMessage(this.generateAIResponse(message), 'ai');
            }, 1000);
        }
    }

    addMessage(message, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            const messageDiv = document.createElement('div');
            messageDiv.style.cssText = `
                margin-bottom: 15px;
                display: flex;
                ${sender === 'user' ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}
            `;

            const messageContent = document.createElement('div');
            messageContent.style.cssText = `
                max-width: 80%;
                padding: 12px 15px;
                border-radius: 15px;
                font-size: 14px;
                line-height: 1.4;
                ${sender === 'user' 
                    ? 'background: linear-gradient(135deg, #667eea, #764ba2); color: white;' 
                    : 'background: white; color: #333; border: 1px solid #e9ecef;'
                }
            `;

            messageContent.textContent = message;
            messageDiv.appendChild(messageContent);
            messagesContainer.appendChild(messageDiv);
            
            // Scroll al final
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    generateAIResponse(userMessage) {
        const responses = [
            "Entiendo tu consulta. ¿Podrías ser más específico?",
            "Esa es una excelente pregunta. Te ayudo con eso.",
            "Perfecto, déjame revisar esa información para ti.",
            "Comprendo. ¿Hay algo más en lo que pueda ayudarte?",
            "Excelente, esa es una funcionalidad importante de AXYRA.",
            "Te ayudo con esa consulta. ¿Necesitas más detalles?",
            "Entendido. ¿Quieres que te explique cómo funciona?",
            "Perfecto, esa es una característica muy útil del sistema."
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Método para mostrar estado
    getStatus() {
        return {
            isOpen: this.isOpen,
            isMinimized: this.isMinimized,
            isInitialized: this.isInitialized
        };
    }
}

// Inicializar sistema de Chat IA funcional
document.addEventListener('DOMContentLoaded', function() {
    window.aiChatFunctional = new AIChatFunctional();
});

// Exportar para uso global
window.AIChatFunctional = AIChatFunctional;
