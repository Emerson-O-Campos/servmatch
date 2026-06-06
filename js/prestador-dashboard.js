// js/prestador-dashboard.js
import { db } from './firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

let graficoPedidos = null;
let graficoReceita = null;

export async function carregarDashboard(prestadorId) {
    console.log("📊 Carregando dashboard para:", prestadorId);
    
    // Buscar pedidos do prestador
    const pedidosQuery = query(collection(db, "pedidos"), where("prestadorId", "==", prestadorId));
    const pedidosSnapshot = await getDocs(pedidosQuery);
    const pedidos = [];
    pedidosSnapshot.forEach(doc => pedidos.push(doc.data()));
    
    // Estatísticas
    const totalPedidos = pedidos.length;
    const pedidosPendentes = pedidos.filter(p => p.status === 'pendente').length;
    const pedidosAceitos = pedidos.filter(p => p.status === 'aceito').length;
    const pedidosConcluidos = pedidos.filter(p => p.status === 'concluido').length;
    const pedidosRecusados = pedidos.filter(p => p.status === 'recusado').length;
    
    // Receita total (apenas concluídos)
    const receitaTotal = pedidos
        .filter(p => p.status === 'concluido')
        .reduce((sum, p) => sum + (p.valorEstimado || 0), 0);
    
    // Atualizar cards de estatísticas
    document.getElementById('dashboardTotalPedidos').textContent = totalPedidos;
    document.getElementById('dashboardPendentes').textContent = pedidosPendentes;
    document.getElementById('dashboardReceita').textContent = `R$ ${receitaTotal.toFixed(2)}`;
    document.getElementById('dashboardAvaliacao').textContent = await calcularMediaAvaliacoes(prestadorId);
    
    // Criar gráfico de status
    criarGraficoStatus(pedidosPendentes, pedidosAceitos, pedidosConcluidos, pedidosRecusados);
    
    // Criar gráfico de receita por mês
    await criarGraficoReceita(pedidos);
}

async function calcularMediaAvaliacoes(prestadorId) {
    const avaliacoesQuery = query(collection(db, "avaliacoes"), where("prestadorId", "==", prestadorId));
    const avaliacoesSnapshot = await getDocs(avaliacoesQuery);
    const avaliacoes = [];
    avaliacoesSnapshot.forEach(doc => avaliacoes.push(doc.data()));
    
    if (avaliacoes.length === 0) return "0.0 ⭐";
    const media = avaliacoes.reduce((sum, a) => sum + a.nota, 0) / avaliacoes.length;
    return `${media.toFixed(1)} ⭐`;
}

function criarGraficoStatus(pendentes, aceitos, concluidos, recusados) {
    const ctx = document.getElementById('graficoStatus')?.getContext('2d');
    if (!ctx) return;
    
    if (graficoPedidos) graficoPedidos.destroy();
    
    graficoPedidos = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pendentes', 'Aceitos', 'Concluídos', 'Recusados'],
            datasets: [{
                data: [pendentes, aceitos, concluidos, recusados],
                backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw} pedido(s)` } }
            }
        }
    });
}

async function criarGraficoReceita(pedidos) {
    const ctx = document.getElementById('graficoReceita')?.getContext('2d');
    if (!ctx) return;
    
    // Agrupar receita por mês
    const receitaPorMes = {};
    pedidos.filter(p => p.status === 'concluido').forEach(p => {
        if (p.criadoEm) {
            const data = p.criadoEm.toDate();
            const mes = `${data.getMonth() + 1}/${data.getFullYear()}`;
            receitaPorMes[mes] = (receitaPorMes[mes] || 0) + (p.valorEstimado || 0);
        }
    });
    
    const meses = Object.keys(receitaPorMes).sort();
    const valores = meses.map(m => receitaPorMes[m]);
    
    if (graficoReceita) graficoReceita.destroy();
    
    graficoReceita = new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses,
            datasets: [{
                label: 'Receita (R$)',
                data: valores,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { tooltip: { callbacks: { label: (ctx) => `R$ ${ctx.raw.toFixed(2)}` } } }
        }
    });
}