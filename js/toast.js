// js/toast.js - Versão Premium

let toastTimeout = null;

export function mostrarToast(mensagem, tipo = 'success') {
    // Remover toast existente
    const toastExistente = document.querySelector('.toast-premium');
    if (toastExistente) {
        toastExistente.remove();
        if (toastTimeout) clearTimeout(toastTimeout);
    }
    
    const config = {
        success: { bg: 'linear-gradient(135deg, #10b981, #059669)', icon: '✅', title: 'Sucesso!' },
        error: { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', icon: '❌', title: 'Erro!' },
        warning: { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', icon: '⚠️', title: 'Atenção!' },
        info: { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', icon: 'ℹ️', title: 'Informação' }
    };
    
    const cfg = config[tipo];
    
    const toast = document.createElement('div');
    toast.className = 'toast-premium';
    toast.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${cfg.bg};
            color: white;
            padding: 1rem 1.25rem;
            border-radius: 1rem;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 360px;
            animation: slideInRight 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            font-weight: 500;
            font-family: 'Inter', system-ui, sans-serif;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        ">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1.5rem;">${cfg.icon}</span>
                <div style="flex: 1;">
                    <div style="font-weight: 700; margin-bottom: 0.25rem;">${cfg.title}</div>
                    <div style="font-size: 0.875rem; opacity: 0.95;">${mensagem}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 1.25rem;">&times;</button>
            </div>
            <div style="
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255,255,255,0.5);
                width: 100%;
                animation: progressBar 3s linear forwards;
                border-radius: 0 0 0 1rem;
            "></div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remover após 3 segundos
    toastTimeout = setTimeout(() => {
        if (toast && toast.parentNode) {
            toast.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}

// Adicionar CSS das animações
if (!document.getElementById('toast-premium-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-premium-styles';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes progressBar {
            from { width: 100%; }
            to { width: 0%; }
        }
    `;
    document.head.appendChild(style);
}

export const mostrarSucesso = (msg) => mostrarToast(msg, 'success');
export const mostrarErro = (msg) => mostrarToast(msg, 'error');
export const mostrarAviso = (msg) => mostrarToast(msg, 'warning');
export const mostrarInfo = (msg) => mostrarToast(msg, 'info');