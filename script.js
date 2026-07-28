// Base de dados local com as informações dos livros
const livrosBase = [
    {
        id: 1,
        titulo: "Hábitos Atômicos",
        autor: "James Clear",
        status: "lendo",
        statusTexto: "Lendo Atualmente",
        comentario: "Excelente leitura para começar o ano com foco e organização!"
    },
    {
        id: 2,
        titulo: "A Biblioteca da Meia-Noite",
        autor: "Matt Haig",
        status: "lido",
        statusTexto: "Lido",
        comentario: "Uma reflexão linda sobre escolhas e arrependimentos. Favoritado!"
    },
    {
        id: 3,
        titulo: "Roube Como um Artista",
        autor: "Austin Kleon",
        status: "lido",
        statusTexto: "Lido",
        comentario: "Leitura rápida, muito visual e inspiradora para processos criativos."
    },
    {
        id: 4,
        titulo: "Foco Roubado",
        autor: "Johann Hari",
        status: "quero-ler",
        statusTexto: "Próxima Leitura",
        comentario: "Escolha do grupo para debater sobre atenção e redes sociais no próximo mês."
    }
];

// Variável para guardar os livros depois de buscar as imagens da API
let livrosEnriquecidos = [];

// Elementos do HTML
// Lorem Ipsum
const container = document.getElementById('books-container');
const botoesFiltro = document.querySelectorAll('.filter-btn');

// Função assíncrona que conecta na Open Library API
async function buscarDadosDaAPI() {
    // Mostra mensagem de carregamento
    container.innerHTML = '<p class="loading">Buscando capas no acervo da Open Library... 📚</p>';

    // Cria uma lista de requisições para todos os livros ao mesmo tempo
    // Lorem Ipsum
    const promessas = livrosBase.map(async (livro) => {
        // Monta a busca para a Open Library API usando título e autor
        const query = `title=${encodeURIComponent(livro.titulo)}&author=${encodeURIComponent(livro.autor)}`;
        const url = `https://openlibrary.org/search.json?${query}`;

        try {
            const resposta = await fetch(url);
            const dados = await resposta.json();

            // Imagem padrão caso o livro não seja encontrado
            let capaUrl = 'https://via.placeholder.com/280x350.png?text=Capa+Indisponível';

            // Se a Open Library encontrou o livro e tem um ID de capa (cover_i)
            if (dados.docs && dados.docs.length > 0) {
                const coverId = dados.docs[0].cover_i;
                if (coverId) {
                    // Monta a imagem da capa: L significa Large (Grande)
                    capaUrl = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
                }
            }

            // Retorna o livro original mesclado com a nova capa
            return { ...livro, capa: capaUrl };

        } catch (erro) {
            console.error(`Erro ao buscar o livro ${livro.titulo}:`, erro);
            // Em caso de erro na conexão, retorna uma imagem de erro
            return { ...livro, capa: 'https://via.placeholder.com/280x350.png?text=Erro+de+Conexão' };
        }
    });

    // Espera todas as buscas terminarem
    // Lorem Ipsum
    livrosEnriquecidos = await Promise.all(promessas);
    
    // Renderiza a tela com as capas reais da API
    renderizarLivros(livrosEnriquecidos);
}

// Função responsável por renderizar os cards na tela
function renderizarLivros(listaDeLivros) {
    container.innerHTML = ""; // Limpa a grid antes de desenhar

    if(listaDeLivros.length === 0) {
        container.innerHTML = `<p class="no-books">Nenhum livro encontrado nesta categoria.</p>`;
        return;
    }

    listaDeLivros.forEach(livro => {
        const card = document.createElement('div');
        card.classList.add('book-card');

        card.innerHTML = `
            <div class="book-cover">
                <img src="${livro.capa}" alt="Capa do livro ${livro.titulo}">
                <span class="status-badge ${livro.status}">${livro.statusTexto}</span>
            </div>
            <div class="book-info">
                <h3 class="book-title">${livro.titulo}</h3>
                <p class="book-author">Por ${livro.autor}</p>
                ${livro.comentario ? `<p class="book-review">"${livro.comentario}"</p>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

// Configuração do evento de clique nos botões de filtro
botoesFiltro.forEach(botao => {
    botao.addEventListener('click', (e) => {
        // Remove a classe 'active' de todos os botões e adiciona no clicado
        botoesFiltro.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const filtroSelecionado = e.target.getAttribute('data-filter');

        // Filtra os livros baseado na categoria ou mostra todos
        if (filtroSelecionado === 'todos') {
            renderizarLivros(livrosEnriquecidos);
        } else {
            const livrosFiltrados = livrosEnriquecidos.filter(livro => livro.status === filtroSelecionado);
            renderizarLivros(livrosFiltrados);
        }
    });
});

// Inicializa a página disparando a busca na API
document.addEventListener('DOMContentLoaded', () => {
    buscarDadosDaAPI();
});