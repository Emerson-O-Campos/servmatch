// js/validacoes.js

// Validar telefone
export function validarTelefone(telefone) {
    const numeros = telefone.replace(/\D/g, '');
    return numeros.length >= 10 && numeros.length <= 11;
}

// Formatar telefone
export function formatarTelefone(telefone) {
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length === 11) {
        return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}

// Validar email
export function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validar preço
export function validarPreco(preco) {
    return preco >= 10 && preco <= 999;
}

// Validar nome
export function validarNome(nome) {
    return nome.trim().length >= 3;
}

// Validar CEP
export function validarCep(cep) {
    const numeros = cep.replace(/\D/g, '');
    return numeros.length === 8;
}

// Validar estado (UF)
export function validarEstado(estado) {
    const estadosValidos = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
    return estadosValidos.includes(estado.toUpperCase());
}

// Validar cidade
export function validarCidade(cidade) {
    return cidade && cidade.trim().length >= 2;
}

// Validar bairro
export function validarBairro(bairro) {
    return bairro && bairro.trim().length >= 2;
}

// Validar senha forte
export function validarSenhaForte(senha) {
    let forca = 0;
    if (senha.length >= 6) forca++;
    if (senha.length >= 8) forca++;
    if (/[A-Z]/.test(senha)) forca++;
    if (/[0-9]/.test(senha)) forca++;
    if (/[^A-Za-z0-9]/.test(senha)) forca++;
    return forca >= 3;
}

// Obter nível de força da senha
export function getSenhaStrength(senha) {
    let forca = 0;
    if (senha.length >= 6) forca++;
    if (senha.length >= 8) forca++;
    if (/[A-Z]/.test(senha)) forca++;
    if (/[0-9]/.test(senha)) forca++;
    if (/[^A-Za-z0-9]/.test(senha)) forca++;
    
    if (forca <= 2) return { level: 'weak', text: 'Senha fraca', color: '#ef4444' };
    if (forca <= 4) return { level: 'medium', text: 'Senha média', color: '#f59e0b' };
    return { level: 'strong', text: 'Senha forte', color: '#10b981' };
}