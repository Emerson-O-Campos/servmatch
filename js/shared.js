import { db } from './firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// Verificar se usuário é prestador
export async function isPrestador(userId) {
    const q = query(collection(db, "prestadores"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}

// Buscar dados do prestador por userId
export async function getPrestadorByUserId(userId) {
    const q = query(collection(db, "prestadores"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }
    return null;
}

// Buscar prestadores por localização (estado/cidade)
export async function buscarPrestadoresPorLocalizacao(estado, cidade, profissao = null) {
    let q = query(collection(db, "prestadores"));
    const querySnapshot = await getDocs(q);
    let prestadores = [];
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        let match = true;
        
        if (estado && data.estado !== estado) match = false;
        if (cidade && data.cidade?.toLowerCase() !== cidade.toLowerCase()) match = false;
        if (profissao && data.profissao?.toLowerCase() !== profissao.toLowerCase()) match = false;
        
        if (match) prestadores.push({ id: doc.id, ...data });
    });
    
    return prestadores;
}

// Validar CEP (formato e busca)
export async function validarEbuscarCep(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
        return { success: false, error: "CEP inválido! Digite 8 números." };
    }
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (data.erro) {
            return { success: false, error: "CEP não encontrado!" };
        }
        
        return {
            success: true,
            data: {
                cep: cepLimpo,
                estado: data.uf,
                cidade: data.localidade,
                bairro: data.bairro,
                logradouro: data.logradouro,
                complemento: data.complemento || ''
            }
        };
    } catch (error) {
        return { success: false, error: "Erro ao buscar CEP" };
    }
}

// Salvar dados do usuário no sessionStorage
export function salvarUsuarioLogado(user) {
    sessionStorage.setItem('userEmail', user.email);
    sessionStorage.setItem('userId', user.uid);
}

// Pegar usuário logado do sessionStorage
export function getUsuarioLogado() {
    return {
        email: sessionStorage.getItem('userEmail'),
        uid: sessionStorage.getItem('userId')
    };
}

// Limpar dados do usuário
export function limparUsuarioLogado() {
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('prestadorDocId');
    sessionStorage.removeItem('prestadorDados');
    sessionStorage.removeItem('prestadorSelecionado');
}

// Formatar telefone para exibição
export function formatarTelefone(telefone) {
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length === 11) {
        return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}

// Formatar CEP para exibição
export function formatarCep(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
        return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return cep;
}

// Obter lista de estados brasileiros
export function getEstadosBrasileiros() {
    return [
        { sigla: "AC", nome: "Acre" },
        { sigla: "AL", nome: "Alagoas" },
        { sigla: "AP", nome: "Amapá" },
        { sigla: "AM", nome: "Amazonas" },
        { sigla: "BA", nome: "Bahia" },
        { sigla: "CE", nome: "Ceará" },
        { sigla: "DF", nome: "Distrito Federal" },
        { sigla: "ES", nome: "Espírito Santo" },
        { sigla: "GO", nome: "Goiás" },
        { sigla: "MA", nome: "Maranhão" },
        { sigla: "MT", nome: "Mato Grosso" },
        { sigla: "MS", nome: "Mato Grosso do Sul" },
        { sigla: "MG", nome: "Minas Gerais" },
        { sigla: "PA", nome: "Pará" },
        { sigla: "PB", nome: "Paraíba" },
        { sigla: "PR", nome: "Paraná" },
        { sigla: "PE", nome: "Pernambuco" },
        { sigla: "PI", nome: "Piauí" },
        { sigla: "RJ", nome: "Rio de Janeiro" },
        { sigla: "RN", nome: "Rio Grande do Norte" },
        { sigla: "RS", nome: "Rio Grande do Sul" },
        { sigla: "RO", nome: "Rondônia" },
        { sigla: "RR", nome: "Roraima" },
        { sigla: "SC", nome: "Santa Catarina" },
        { sigla: "SP", nome: "São Paulo" },
        { sigla: "SE", nome: "Sergipe" },
        { sigla: "TO", nome: "Tocantins" }
    ];
}

// ============================================
// FUNÇÕES DE GEOLOCALIZAÇÃO
// ============================================

// Calcular distância entre dois pontos (Haversine formula)
export function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Obter localização do usuário
export function obterLocalizacaoUsuario() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject("Seu navegador não suporta geolocalização");
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                let mensagem = "";
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        mensagem = "Permissão negada. Ative a localização nas configurações.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        mensagem = "Localização indisponível";
                        break;
                    case error.TIMEOUT:
                        mensagem = "Tempo esgotado";
                        break;
                    default:
                        mensagem = "Erro ao obter localização";
                }
                reject(mensagem);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

// Converter endereço em coordenadas (geocoding)
export async function buscarCoordenadasPorEndereco(cep, cidade, estado) {
    if (!cep && !cidade) return null;
    
    const enderecoCompleto = `${cep || ''}, ${cidade || ''}, ${estado || ''}, Brasil`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(enderecoCompleto)}&format=json&limit=1`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
        return null;
    } catch (error) {
        console.error("Erro ao buscar coordenadas:", error);
        return null;
    }
}