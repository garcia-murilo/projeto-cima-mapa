// Passo A: Configuração do Supabase
const SUPABASE_URL = 'https://nhiijcgvxxqolnhssmhk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oaWlqY2d2eHhxb2xuaHNzbWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5ODYwNDQsImV4cCI6MjA3MzU2MjA0NH0.zHysnXS6PqU37GRUXDl1Md0RoSpsa6X4V8MI-EMypm0';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Passo B: Inicialização do Mapa
const initialCoords = [-22.9068, -43.1729];
const map = L.map('map').setView(initialCoords, 12);

L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Função para buscar dados e adicionar ao mapa
async function carregarDadosDosSensores() {
    
    // RASTREAMENTO 1: A função foi chamada?
    console.log("ETAPA 1: Função carregarDadosDosSensores foi chamada.");

    try {
        const { data, error } = await supabaseClient
            .from('Sensores')
            .select('*');

        // RASTREAMENTO 2: A consulta ao Supabase terminou. O que recebemos?
        console.log("ETAPA 2: Consulta ao Supabase finalizada.", { data, error });

        if (error) {
            console.error('ERRO DETECTADO:', error);
            return;
        }

        data.forEach(leitura => {
            if (leitura.latitude && leitura.longitude) {
                const marcador = L.marker([leitura.latitude, leitura.longitude]).addTo(map);
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

    } catch (catchError) {
        // RASTREAMENTO 3: Ocorreu um erro inesperado na consulta.
        console.error("ETAPA 3: Ocorreu um erro CATASTRÓFICO durante a consulta.", catchError);
    }
}

// Chama a função para carregar os dados
carregarDadosDosSensores();
