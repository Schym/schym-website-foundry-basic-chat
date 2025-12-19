/**
 * Schym Chat Widget
 * Embeddable AI chat component for schym.de
 * 
 * Usage:
 *   <div id="schym-chat"></div>
 *   <script src="schym-chat-widget.js"></script>
 *   <script>
 *     SchymChat.init({
 *       container: '#schym-chat',
 *       apiUrl: 'https://chat.schym.de',
 *       theme: 'light' // or 'dark'
 *     });
 *   </script>
 */

(function(window) {
  'use strict';

  const SchymChat = {
    config: {
      container: '#schym-chat',
      apiUrl: 'https://chat.schym.de',
      theme: 'light',
      placeholder: 'Stelle eine Frage...',
      title: 'Chat mit KI',
      welcomeMessage: 'Hallo! Wie kann ich dir helfen?',
      styles: {} // Custom style overrides
    },

    messages: [],
    isLoading: false,

    init(options = {}) {
      this.config = { ...this.config, ...options };
      this.container = document.querySelector(this.config.container);
      
      if (!this.container) {
        console.error('SchymChat: Container not found:', this.config.container);
        return;
      }

      this.render();
      this.attachEvents();
      
      // Add welcome message
      if (this.config.welcomeMessage) {
        this.addMessage('assistant', this.config.welcomeMessage);
      }
    },

    render() {
      const theme = this.config.theme;
      
      this.container.innerHTML = `
        <div class="schym-chat-widget schym-chat-${theme}" style="${this.getContainerStyles()}">
          <div class="schym-chat-header" style="${this.getHeaderStyles()}">
            <span class="schym-chat-title">${this.config.title}</span>
            <button class="schym-chat-minimize" aria-label="Minimize">−</button>
          </div>
          <div class="schym-chat-messages" style="${this.getMessagesStyles()}">
          </div>
          <div class="schym-chat-input-area" style="${this.getInputAreaStyles()}">
            <textarea 
              class="schym-chat-input" 
              placeholder="${this.config.placeholder}"
              rows="1"
              style="${this.getInputStyles()}"
            ></textarea>
            <button class="schym-chat-send" style="${this.getSendButtonStyles()}" aria-label="Send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      `;

      this.messagesContainer = this.container.querySelector('.schym-chat-messages');
      this.input = this.container.querySelector('.schym-chat-input');
      this.sendButton = this.container.querySelector('.schym-chat-send');
    },

    getContainerStyles() {
      const base = `
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 400px;
        height: 500px;
        border-radius: 12px;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      `;
      const theme = this.config.theme === 'dark' 
        ? 'background: #1a1a2e; color: #fff;'
        : 'background: #fff; color: #333;';
      return base + theme + (this.config.styles.container || '');
    },

    getHeaderStyles() {
      const base = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        font-weight: 600;
      `;
      const theme = this.config.theme === 'dark'
        ? 'background: #16213e; border-bottom: 1px solid #0f3460;'
        : 'background: #f8f9fa; border-bottom: 1px solid #e9ecef;';
      return base + theme + (this.config.styles.header || '');
    },

    getMessagesStyles() {
      return `
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      ` + (this.config.styles.messages || '');
    },

    getInputAreaStyles() {
      const base = `
        display: flex;
        gap: 8px;
        padding: 12px;
      `;
      const theme = this.config.theme === 'dark'
        ? 'background: #16213e; border-top: 1px solid #0f3460;'
        : 'background: #f8f9fa; border-top: 1px solid #e9ecef;';
      return base + theme + (this.config.styles.inputArea || '');
    },

    getInputStyles() {
      const base = `
        flex: 1;
        padding: 10px 14px;
        border-radius: 20px;
        border: none;
        outline: none;
        resize: none;
        font-size: 14px;
        line-height: 1.4;
      `;
      const theme = this.config.theme === 'dark'
        ? 'background: #0f3460; color: #fff;'
        : 'background: #fff; color: #333; border: 1px solid #ddd;';
      return base + theme + (this.config.styles.input || '');
    },

    getSendButtonStyles() {
      return `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: #007bff;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      ` + (this.config.styles.sendButton || '');
    },

    attachEvents() {
      this.sendButton.addEventListener('click', () => this.sendMessage());
      
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Auto-resize textarea
      this.input.addEventListener('input', () => {
        this.input.style.height = 'auto';
        this.input.style.height = Math.min(this.input.scrollHeight, 100) + 'px';
      });

      // Minimize button
      const minimizeBtn = this.container.querySelector('.schym-chat-minimize');
      if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => this.toggleMinimize());
      }
    },

    toggleMinimize() {
      const widget = this.container.querySelector('.schym-chat-widget');
      widget.classList.toggle('schym-chat-minimized');
    },

    addMessage(role, content) {
      this.messages.push({ role, content });
      
      const messageEl = document.createElement('div');
      messageEl.className = `schym-chat-message schym-chat-${role}`;
      messageEl.style.cssText = this.getMessageStyles(role);
      
      // Parse markdown-like formatting
      const formattedContent = this.formatContent(content);
      messageEl.innerHTML = formattedContent;
      
      this.messagesContainer.appendChild(messageEl);
      this.scrollToBottom();
    },

    getMessageStyles(role) {
      const base = `
        padding: 10px 14px;
        border-radius: 16px;
        max-width: 85%;
        word-wrap: break-word;
        line-height: 1.5;
        font-size: 14px;
      `;
      
      if (role === 'user') {
        return base + `
          align-self: flex-end;
          background: #007bff;
          color: white;
          border-bottom-right-radius: 4px;
        `;
      } else {
        const theme = this.config.theme === 'dark'
          ? 'background: #0f3460; color: #e0e0e0;'
          : 'background: #f1f3f4; color: #333;';
        return base + theme + `
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        `;
      }
    },

    formatContent(content) {
      // Basic markdown formatting
      return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code style="background:#e0e0e0;padding:2px 4px;border-radius:3px;">$1</code>')
        .replace(/\n/g, '<br>');
    },

    scrollToBottom() {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    },

    async sendMessage() {
      const content = this.input.value.trim();
      if (!content || this.isLoading) return;

      this.input.value = '';
      this.input.style.height = 'auto';
      this.addMessage('user', content);
      
      this.isLoading = true;
      this.sendButton.disabled = true;
      
      // Add loading indicator
      const loadingEl = document.createElement('div');
      loadingEl.className = 'schym-chat-loading';
      loadingEl.style.cssText = this.getMessageStyles('assistant');
      loadingEl.innerHTML = '<span class="schym-chat-dots">●●●</span>';
      this.messagesContainer.appendChild(loadingEl);
      this.scrollToBottom();

      try {
        const response = await this.callAPI(content);
        loadingEl.remove();
        this.addMessage('assistant', response);
      } catch (error) {
        loadingEl.remove();
        this.addMessage('assistant', 'Entschuldigung, es gab einen Fehler. Bitte versuche es erneut.');
        console.error('SchymChat Error:', error);
      }

      this.isLoading = false;
      this.sendButton.disabled = false;
      this.input.focus();
    },

    async callAPI(userMessage) {
      // Build messages array for API
      const apiMessages = this.messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch(`${this.config.apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              // Handle the API's response format
              if (data.content && data.type === 'message') {
                fullResponse += data.content;
              } else if (data.content && data.type === 'completed_message') {
                // Use completed message if available
                fullResponse = data.content;
              }
            } catch (e) {
              // Skip non-JSON lines
            }
          }
        }
      }

      return fullResponse || 'Keine Antwort erhalten.';
    }
  };

  // Expose to window
  window.SchymChat = SchymChat;

})(window);
