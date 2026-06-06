# gerar-config.ps1
$envContent = Get-Content ".env" -Raw
$configPath = "js/config.js"

$apiKey = ($envContent | Select-String 'VITE_FIREBASE_API_KEY=(.*)').Matches.Groups[1].Value
$authDomain = ($envContent | Select-String 'VITE_FIREBASE_AUTH_DOMAIN=(.*)').Matches.Groups[1].Value
$projectId = ($envContent | Select-String 'VITE_FIREBASE_PROJECT_ID=(.*)').Matches.Groups[1].Value
$storageBucket = ($envContent | Select-String 'VITE_FIREBASE_STORAGE_BUCKET=(.*)').Matches.Groups[1].Value
$messagingSenderId = ($envContent | Select-String 'VITE_FIREBASE_MESSAGING_SENDER_ID=(.*)').Matches.Groups[1].Value
$appId = ($envContent | Select-String 'VITE_FIREBASE_APP_ID=(.*)').Matches.Groups[1].Value

$configContent = @"
// js/config.js - ARQUIVO GERADO AUTOMATICAMENTE
// NÃO EDITAR MANUALMENTE - Gerado a partir do .env

export const firebaseConfig = {
    apiKey: "$apiKey",
    authDomain: "$authDomain",
    projectId: "$projectId",
    storageBucket: "$storageBucket",
    messagingSenderId: "$messagingSenderId",
    appId: "$appId"
};

// Validação das configurações
export function validarFirebaseConfig() {
    const missingKeys = [];
    for (const [key, value] of Object.entries(firebaseConfig)) {
        if (!value || value === 'undefined' || value === 'SUA_API_KEY_AQUI') {
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
"@

Set-Content -Path $configPath -Value $configContent
Write-Host "✅ config.js gerado com sucesso!" -ForegroundColor Green