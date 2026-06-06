// js/auth.js - Versão completa com verificação de e-mail (CORRIGIDA)
import { auth } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { limparUsuarioLogado } from './shared.js';

// Verificar se usuário está logado
export function checkAuth(redirectUrl = 'index.html') {
    onAuthStateChanged(auth, (user) => {
        if (!user && window.location.pathname !== '/index.html' && !window.location.pathname.includes('prestador-login')) {
            const paginasPublicas = ['index.html', 'detalhes.html', 'avaliar.html', 'verificar-email.html'];
            const paginaAtual = window.location.pathname.split('/').pop();
            if (!paginasPublicas.includes(paginaAtual)) {
                window.location.href = redirectUrl;
            }
        }
    });
}

// Fazer login (com verificação de email)
export async function fazerLogin(email, senha) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;
        
        // VERIFICAR SE EMAIL FOI VERIFICADO
        if (!user.emailVerified) {
            // Enviar novo e-mail de verificação
            await sendEmailVerification(user);
            await signOut(auth);
            return { 
                success: false, 
                error: '📧 E-mail não verificado! Um novo link de verificação foi enviado para seu e-mail. Verifique sua caixa de entrada e spam.',
                requiresVerification: true
            };
        }
        
        return { success: true, user: user };
    } catch (error) {
        let mensagem = error.message;
        if (error.code === 'auth/invalid-credential') {
            mensagem = 'E-mail ou senha inválidos';
        } else if (error.code === 'auth/user-not-found') {
            mensagem = 'Usuário não encontrado';
        } else if (error.code === 'auth/wrong-password') {
            mensagem = 'Senha incorreta';
        } else if (error.code === 'auth/too-many-requests') {
            mensagem = 'Muitas tentativas. Tente novamente mais tarde';
        } else if (error.code === 'auth/invalid-email') {
            mensagem = 'E-mail inválido';
        }
        return { success: false, error: mensagem };
    }
}

// Criar conta (com envio de verificação de email) - CORRIGIDO
export async function criarConta(email, senha) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;
        
        // ENVIAR E-MAIL DE VERIFICAÇÃO
        await sendEmailVerification(user);
        
        // ✅ NÃO FAZER LOGOUT AQUI!
        // Deixamos o usuário logado para salvar os dados no Firestore
        
        return { 
            success: true, 
            user: user,
            message: 'Conta criada! Enviamos um link de verificação para seu e-mail. Confirme antes de fazer login.'
        };
    } catch (error) {
        let mensagem = error.message;
        if (error.code === 'auth/email-already-in-use') {
            mensagem = 'Este e-mail já está cadastrado';
        } else if (error.code === 'auth/weak-password') {
            mensagem = 'A senha deve ter pelo menos 6 caracteres';
        } else if (error.code === 'auth/invalid-email') {
            mensagem = 'E-mail inválido';
        } else if (error.code === 'auth/operation-not-allowed') {
            mensagem = 'Cadastro temporariamente desativado. Tente novamente mais tarde.';
        }
        return { success: false, error: mensagem };
    }
}

// Reenviar e-mail de verificação
export async function reenviarVerificacaoEmail() {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
        try {
            await sendEmailVerification(user);
            return { success: true, message: 'E-mail de verificação reenviado! Verifique sua caixa de entrada e spam.' };
        } catch (error) {
            let mensagem = error.message;
            if (error.code === 'auth/too-many-requests') {
                mensagem = 'Muitas solicitações. Aguarde alguns minutos e tente novamente.';
            }
            return { success: false, error: mensagem };
        }
    }
    return { success: false, error: 'Nenhum usuário ou e-mail já verificado' };
}

// Verificar se email já foi verificado
export async function verificarEmailVerificado() {
    try {
        await auth.currentUser?.reload();
        const user = auth.currentUser;
        return user ? user.emailVerified : false;
    } catch (error) {
        console.error("Erro ao verificar email:", error);
        return false;
    }
}

// Recuperar senha
export async function recuperarSenha(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        let mensagem = error.message;
        if (error.code === 'auth/user-not-found') {
            mensagem = 'E-mail não encontrado';
        } else if (error.code === 'auth/invalid-email') {
            mensagem = 'E-mail inválido';
        } else if (error.code === 'auth/too-many-requests') {
            mensagem = 'Muitas tentativas. Aguarde alguns minutos.';
        }
        return { success: false, error: mensagem };
    }
}

// Fazer logout
export async function fazerLogout() {
    limparUsuarioLogado();
    await signOut(auth);
    window.location.href = 'index.html';
}

// Pegar usuário atual
export function getCurrentUser() {
    return auth.currentUser;
}

// Pegar token do usuário
export async function getToken() {
    const user = auth.currentUser;
    if (user) {
        return await user.getIdToken();
    }
    return null;
}