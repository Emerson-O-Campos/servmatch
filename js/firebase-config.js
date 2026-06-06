// js/firebase-config.js
import { firebaseConfig, validarFirebaseConfig, isFirebaseConfigValid } from './config.js';

// Importar Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// ============================================
// VALIDAÇÃO DAS CONFIGURAÇÕES COM FALLBACK
// ============================================

let configValida = false;
let erroConfiguracao = null;

try {
    configValida = validarFirebaseConfig();
} catch (error) {
    console.error('❌ Erro ao validar configurações do Firebase:', error);
    erroConfiguracao = error;
    configValida = false;
}

if (!configValida) {
    console.warn('⚠️ ATENÇÃO: Configurações do Firebase inválidas!');
    console.warn('Verifique se o arquivo js/config.js está configurado corretamente');
    console.warn('O aplicativo pode não funcionar corretamente.');
}

// ============================================
// INICIALIZAÇÃO DO FIREBASE
// ============================================

let app = null;
let auth = null;
let db = null;

try {
    // Tentar inicializar mesmo com possíveis problemas de configuração
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    console.log('✅ Firebase inicializado com sucesso');
} catch (error) {
    console.error('❌ Erro FATAL ao inicializar Firebase:', error);
    console.error('Verifique suas credenciais no arquivo js/config.js');
    
    // Criar objetos vazios para evitar erros em cascata
    // Isso permite que o app "funcione" mesmo sem Firebase (apenas para teste)
    auth = {
        currentUser: null,
        onAuthStateChanged: (callback) => {
            callback(null);
            return () => {};
        }
    };
    db = {
        collection: () => ({
            doc: () => ({
                get: async () => ({ exists: false, data: () => ({}) }),
                set: async () => {},
                update: async () => {}
            }),
            add: async () => ({ id: 'mock-id' }),
            get: async () => ({ docs: [], forEach: () => {} })
        })
    };
}

// ============================================
// EXPORTAÇÕES
// ============================================

export { auth, db };
export { app };

// Função auxiliar para verificar se o Firebase está pronto
export function isFirebaseReady() {
    return configValida && app !== null && auth !== null && db !== null;
}

// Função para obter erro de configuração (se houver)
export function getFirebaseConfigError() {
    return erroConfiguracao;
}

// Função para tentar reinicializar (útil após correção manual)
export function reinicializarFirebase() {
    if (app) {
        console.warn('Firebase já inicializado, reinicializando...');
    }
    
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        configValida = true;
        erroConfiguracao = null;
        console.log('✅ Firebase reinicializado com sucesso');
        return true;
    } catch (error) {
        console.error('❌ Erro ao reinicializar Firebase:', error);
        return false;
    }
}