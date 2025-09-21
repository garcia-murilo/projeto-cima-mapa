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


function gerarDiagnosticoAgua(leitura) {
    const { temperatura, ph, turbidez } = leitura;
    let classe = '';
    let cor = '';
    let observacao = '';

    if (ph >= 6.8 && ph <= 7.5 && turbidez < 2) {
        classe = 'Ótima'; cor = '#007BFF';
    } else if (ph >= 6.0 && ph <= 9.0 && turbidez < 20) {
        classe = 'Boa'; cor = 'green';
    } else if (ph >= 6.0 && ph <= 9.0 && turbidez < 40) {
        classe = 'Aceitável'; cor = '#FFC107';
    } else if (turbidez >= 100) {
        classe = 'Crítica'; cor = '#DC3545';
    } else {
        classe = 'Inadequada'; cor = '#F08C00';
    }

    if (temperatura > 30) {
        observacao = ' (Fator de Estresse: Temperatura Alta)';
    }
    const textoFinal = `${classe}${observacao}`;
    return { texto: textoFinal, cor: cor };
}

// ▼▼▼ ADIÇÃO 1: Variáveis para guardar os marcadores e dados ▼▼▼
let marcadores = {};
let dadosIniciais = {};

// Função para buscar dados e adicionar ao mapa
async function carregarDadosDosSensores() {

    const { data, error } = await supabaseClient.from('Sensores').select('*');

    if (error) {
        console.error('Erro ao buscar dados:', error);
        return;
    }

    data.forEach(leitura => {
        if (leitura.latitude && leitura.longitude) {
            
            // Cria um ícone inicial (a cor será atualizada na simulação se for o alvo)
            const icone = L.AwesomeMarkers.icon({
                icon: 'circle',
                markerColor: 'green',
                prefix: 'fa',
                iconSize: [35, 45],
                iconAnchor: [17, 42],
                popupAnchor: [1, -34],
                extraClasses: 'fa-2x'
            });
            
            const marcador = L.marker([leitura.latitude, leitura.longitude], { icon: icone }).addTo(map);
            const diagnostico = gerarDiagnosticoAgua(leitura);

            marcador.bindPopup(`
                <b>Ponto de Coleta:</b> ${leitura.nome_ponto}<br>
                <hr>
                <b>Temperatura:</b> ${leitura.temperatura ? leitura.temperatura.toFixed(2) + ' °C' : 'N/A'}<br>
                <b>pH:</b> ${leitura.ph ? leitura.ph.toFixed(2) : 'N/A'}<br>
                <b>Turbidez:</b> ${leitura.turbidez ? leitura.turbidez.toFixed(2) + ' NTU' : 'N/A'}<br>
                <br>
                <b>Diagnóstico: <span style="color: ${diagnostico.cor}; font-weight: bold;">${diagnostico.texto}</span></b><br>
                <br>
                <b>Data da Leitura:</b> ${new Date(leitura.created_at).toLocaleString('pt-BR')}
            `);

            // ▼▼▼ ADIÇÃO 2: Guarda o marcador e seus dados iniciais ▼▼▼
            marcadores[leitura.nome_ponto] = marcador;
            dadosIniciais[leitura.nome_ponto] = leitura;
        }
    });

    // ▼▼▼ ADIÇÃO 3: Inicia a simulação DEPOIS que os marcadores foram criados ▼▼▼
    iniciarSimulacaoTempoReal();
}

// ▼▼▼ ADIÇÃO 4: A nova função que cria a simulação em tempo real ▼▼▼
function iniciarSimulacaoTempoReal() {
    const nomeDaEstacao = 'Torneira - Centro de Tecnologia (CT)';
    const marcadorAlvo = marcadores[nomeDaEstacao];
    let dadosAtuais = { ...dadosIniciais[nomeDaEstacao] };

    if (!marcadorAlvo || !dadosAtuais) {
        console.error("Estação para simulação não encontrada ou dados iniciais ausentes:", nomeDaEstacao);
        return;
    }

    // A cada 3 segundos, esta função irá rodar
    setInterval(() => {
        // 1. Gera novos dados com pequenas variações aleatórias
        dadosAtuais.ph += (Math.random() - 0.5) * 0.2;
        dadosAtuais.turbidez += (Math.random() - 0.5) * 0.3;
        if (dadosAtuais.turbidez < 0) dadosAtuais.turbidez = 0.1;

        // 2. Recalcula o diagnóstico
        const novoDiagnostico = gerarDiagnosticoAgua(dadosAtuais);

        // 3. Cria o novo conteúdo do pop-up
        const novoConteudo = `
            <b>Ponto de Coleta:</b> ${dadosAtuais.nome_ponto}<br><hr>
            <b>Temperatura:</b> ${dadosAtuais.temperatura.toFixed(2)} °C<br>
            <b>pH:</b> ${dadosAtuais.ph.toFixed(2)}<br>
            <b>Turbidez:</b> ${dadosAtuais.turbidez.toFixed(2)} NTU<br><br>
            <b>Diagnóstico: <span style="color: ${novoDiagnostico.cor}; font-weight: bold;">${novoDiagnostico.texto}</span></b><br><br>
            <b>Data da Leitura:</b> ${new Date().toLocaleString('pt-BR')}`; // Atualiza para a hora atual

        // 4. Atualiza o pop-up do marcador
        marcadorAlvo.setPopupContent(novoConteudo);
        
        // 5. Aplica o efeito de pulso
        const iconeElemento = marcadorAlvo._icon;
        if (iconeElemento) {
            iconeElemento.classList.add('marker-pulse');
            setTimeout(() => {
                iconeElemento.classList.remove('marker-pulse');
            }, 1500); // Remove a classe depois que a animação terminar
        }
        
    }, 3000); // Intervalo de 3 segundos
}

// Chama a função principal para carregar os dados
carregarDadosDosSensores();
