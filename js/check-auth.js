// js/check-auth.js
import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { salvarUsuarioLogado } from './shared.js';
import { verificarEmailVerificado } from './auth.js';

// ============================================
// FUNÇÃO AUXILIAR PARA VERIFICAR EMAIL
// ============================================
async function verificarEmailAntesDeProsseguir(user, redirecionarPara = 'verificar-email.html') {
    if (!user) return false;
    
    await user.reload();
    if (!user.emailVerified) {
        window.location.href = redirecionarPara;
        return false;
    }
    return true;
}

// ============================================
// PROTEÇÃO DE PÁGINAS
// ============================================

// Protege páginas que exigem login (redireciona para prestador-login)
export function protegerPagina() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Verificar se email foi verificado
                const emailOk = await verificarEmailAntesDeProsseguir(user, 'verificar-email.html');
                if (!emailOk) {
                    reject('Email não verificado');
                    return;
                }
                salvarUsuarioLogado(user);
                resolve(user);
            } else {
                window.location.href = 'prestador-login.html';
                reject('Não autenticado');
            }
        });
    });
}

// Protege páginas de cliente (redireciona para cliente-login)
export function protegerPaginaCliente() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Verificar se email foi verificado
                const emailOk = await verificarEmailAntesDeProsseguir(user, 'verificar-email.html');
                if (!emailOk) {
                    reject('Email não verificado');
                    return;
                }
                salvarUsuarioLogado(user);
                resolve(user);
            } else {
                window.location.href = 'cliente-login.html';
                reject('Não autenticado');
            }
        });
    });
}

// Protege páginas de prestador (verifica se é prestador E email verificado)
export async function protegerPaginaPrestador() {
    const user = await new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Verificar email primeiro
                await user.reload();
                if (!user.emailVerified) {
                    window.location.href = 'verificar-email.html';
                    reject('Email não verificado');
                    return;
                }
                resolve(user);
            } else {
                window.location.href = 'prestador-login.html';
                reject('Não autenticado');
            }
        });
    });
    
    // Verificar se o usuário é um prestador cadastrado
    const { db } = await import('./firebase-config.js');
    const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js");
    
    const q = query(collection(db, "prestadores"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        // Usuário não é prestador
        alert("Você não está cadastrado como prestador!");
        window.location.href = 'prestador-login.html';
        throw new Error('Não é prestador');
    }
    
    salvarUsuarioLogado(user);
    return user;
}

// ============================================
// VERIFICAÇÕES (NÃO BLOQUEIAM)
// ============================================

// Verificar se cliente está logado (não bloqueia, só retorna)
export function verificarClienteLogado() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                salvarUsuarioLogado(user);
                resolve(user);
            } else {
                resolve(null);
            }
        });
    });
}

// Verificar se prestador está logado (não bloqueia, só retorna)
export function verificarPrestadorLogado() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                salvarUsuarioLogado(user);
                resolve(user);
            } else {
                resolve(null);
            }
        });
    });
}

// Verificar se cliente está logado E com email verificado
export async function verificarClienteLogadoVerificado() {
    const user = await verificarClienteLogado();
    if (!user) return null;
    
    await user.reload();
    if (!user.emailVerified) return null;
    
    return user;
}

// Verificar se prestador está logado E com email verificado
export async function verificarPrestadorLogadoVerificado() {
    const user = await verificarPrestadorLogado();
    if (!user) return null;
    
    await user.reload();
    if (!user.emailVerified) return null;
    
    return user;
}

// Pegar usuário atual (sem verificação de email)
export function getUsuarioAtual() {
    return auth.currentUser;
}

// Pegar usuário atual COM verificação de email
export async function getUsuarioAtualVerificado() {
    const user = auth.currentUser;
    if (!user) return null;
    
    await user.reload();
    if (!user.emailVerified) return null;
    
    return user;
}