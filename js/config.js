// js/config.js - VERSÃO PARA HTML PURO (SEM BUNDLER)
// ⚠️ NUNCA COMMITAR ESTE ARQUIVO! ⚠️
// Adicione ao .gitignore imediatamente

export const firebaseConfig = {
    apiKey: "AIzaSyAQjVdnjySnfPhCpg_4Qvd0_ABl2tUduhU",
    authDomain: "teste-app-servicos.firebaseapp.com",
    projectId: "teste-app-servicos",
    storageBucket: "teste-app-servicos.firebasestorage.app",
    messagingSenderId: "90583291206",
    appId: "1:90583291206:web:b4823d6bce1704af6a0147"
};

// ============================================
// VALIDAÇÃO DAS CONFIGURAÇÕES
// ============================================
export function validarFirebaseConfig() {
    const missingKeys = [];
    const invalidKeys = [];
    
    for (const [key, value] of Object.entries(firebaseConfig)) {
        if (!value || value === 'undefined') {
            missingKeys.push(key);
        } else if (value === 'SUA_API_KEY_AQUI' || value === 'SEU_AUTH_DOMAIN') {
            invalidKeys.push(key);
        }
    }
    
    if (missingKeys.length > 0) {
        console.error('❌ Firebase: Configurações faltando:', missingKeys);
        console.error('Verifique se o arquivo config.js tem todas as credenciais');
        return false;
    }
    
    if (invalidKeys.length > 0) {
        console.error('❌ Firebase: Configurações com valores de exemplo:', invalidKeys);
        console.error('Substitua pelos valores reais do seu projeto Firebase');
        return false;
    }
    
    console.log('✅ Firebase: Configurações carregadas com sucesso');
    return true;
}

// Verificar se as configurações são válidas (sem lançar erro)
export function isFirebaseConfigValid() {
    try {
        return validarFirebaseConfig();
    } catch (error) {
        console.error('❌ Erro ao validar configurações:', error);
        return false;
    }
}