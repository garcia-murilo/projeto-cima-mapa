import { createClient } from '@supabase/supabase-js'

// Passo A: Configuração do Supabase
const SUPABASE_URL = 'https://nhiijcgvxxqolnhssmhk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oaWlqY2d2eHhxb2xuaHNzbWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5ODYwNDQsImV4cCI6MjA3MzU2MjA0NH0.zHysnXS6PqU37GRUXDl1Md0RoSpsa6X4V8MI-EMypm0';

// Passo B: Inicialização do Mapa
// Coordenadas para centralizar o mapa (ex: Rio de Janeiro)
const initialCoords = [-22.9068, -43.1729];
const map = L.map('map').setView(initialCoords, 12); // O '12' é o nível de zoom

// Adiciona o "fundo" do mapa (o mapa em si) do OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Função para buscar dados e adicionar ao mapa
async function carregarDadosDosSensores() {
    // 1. Busca os dados da tabela 'sensores' no Supabase
    const { data, error } = await supabaseClient
        .from('Sensores')
        .select('*'); // Seleciona todas as colunas

    if (error) {
        console.error('Erro ao buscar dados:', error);
        return;
    }

    // 2. Itera sobre cada leitura de sensor e adiciona um marcador no mapa
    data.forEach(leitura => {
        if (leitura.latitude && leitura.longitude) {
            const marcador = L.marker([leitura.latitude, leitura.longitude]).addTo(map);
            
            // 3. Adiciona um pop-up com as informações específicas de qualidade da água
            //    Arredondamos os valores para duas casas decimais para melhor visualização
            marcador.bindPopup(`
                <b>Ponto de Coleta:</b> ${leitura.nome_ponto}<br>
                <hr>
                <b>Temperatura:</b> ${leitura.temperatura ? leitura.temperatura.toFixed(2) + ' °C' : 'N/A'}<br>
                <b>pH:</b> ${leitura.ph ? leitura.ph.toFixed(2) : 'N/A'}<br>
                <b>Turbidez:</b> ${leitura.turbidez ? leitura.turbidez.toFixed(2) + ' NTU' : 'N/A'}<br>
                <br>
                <b>Data da Leitura:</b> ${new Date(leitura.created_at).toLocaleString('pt-BR')}
            `);
        }
    });
}

// Chama a função para carregar os dados
carregarDadosDosSensores();
