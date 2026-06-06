#!/bin/bash
# gerar-config.sh

if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    exit 1
fi

source .env

cat > js/config.js << EOF
// js/config.js - ARQUIVO GERADO AUTOMATICAMENTE
// NÃO EDITAR MANUALMENTE - Gerado a partir do .env

export const firebaseConfig = {
    apiKey: "$VITE_FIREBASE_API_KEY",
    authDomain: "$VITE_FIREBASE_AUTH_DOMAIN",
    projectId: "$VITE_FIREBASE_PROJECT_ID",
    storageBucket: "$VITE_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "$VITE_FIREBASE_MESSAGING_SENDER_ID",
    appId: "$VITE_FIREBASE_APP_ID"
};

// Validação das configurações
export function validarFirebaseConfig() {
    const missingKeys = [];
    for (const [key, value] of Object.entries(firebaseConfig)) {
        if (!value || value === 'undefined') {
            missingKeys.push(key);
        }
    }
    
    if (missingKeys.length > 0) {
        console.error('❌ Firebase: Configurações faltando:', missingKeys);
        console.error('Execute o script gerar-config.js para criar o config.js corretamente');
        return false;
    }
    
    console.log('✅ Firebase: Configurações carregadas com sucesso');
    return true;
}
EOF

echo "✅ config.js gerado com sucesso!"