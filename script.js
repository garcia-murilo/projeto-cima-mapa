// Passo A: Configuração do Supabase
const SUPABASE_URL = 'https://nhiijcgvxxqolnhssmhk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oaWlqY2d2eHhxb2xuaHNzbWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5ODYwNDQsImV4cCI6MjA3MzU2MjA0NH0.zHysnXS6PqU37GRUXDl1Md0RoSpsa6X4V8MI-EMypm0';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Passo B: Inicialização do Mapa
const initialCoords = [-22.9068, -43.1729];
const map = L.map('map').setView(initialCoords, 12);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
}).addTo(map);


// Função para buscar dados e adicionar ao mapa
async function carregarDadosDosSensores() {

    // 1. Crie o ícone personalizado aqui
    // Cores disponíveis: 'red', 'darkred', 'orange', 'green', 'darkgreen',
    // 'blue', 'purple', 'darkpurple', 'cadetblue'
    const iconePersonalizado = L.AwesomeMarkers.icon({
        icon: 'circle',
        markerColor: 'white',
        prefix: 'fa',
        iconSize:    [35, 45], // Tamanho do pino
        iconAnchor:  [17, 42], // Posição da "ponta" do pino
        popupAnchor: [1, -34]  // Posição de onde o popup sai

    });

    const { data, error } = await supabaseClient
        .from('Sensores')
        .select('*');

    if (error) {
        console.error('Erro ao buscar dados:', error);
        return;
    }

    data.forEach(leitura => {
        if (leitura.latitude && leitura.longitude) {
            
            // 2. Use o ícone personalizado ao criar o marcador
            const marcador = L.marker([leitura.latitude, leitura.longitude], {icon: iconePersonalizado}).addTo(map);
            
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
