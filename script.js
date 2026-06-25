// Base de dados simulada para os livros do Clube da Nathy
const livros = [
    {
        id: 1,
        titulo: "Hábitos Atômicos",
        autor: "James Clear",
        status: "lendo", // lido | lendo | quero-ler
        statusTexto: "Lendo Atualmente",
        capa: "https://images-na.ssl-images-amazon.com/images/I/81Y8S98SULL.jpg",
        comentario: "Excelente leitura para começar o ano com foco e organização!"
    },
    {
        id: 2,
        titulo: "A Biblioteca da Meia-Noite",
        autor: "Matt Haig",
        status: "lido",
        statusTexto: "Lido",
        capa: "https://images-na.ssl-images-amazon.com/images/I/818z+p9KgDL.jpg",
        comentario: "Uma reflexão linda sobre escolhas e arrependimentos. Favoritado!"
    },
    {
        id: 3,
        titulo: "Roube Como um Artista",
        autor: "Austin Kleon",
        status: "lido",
        statusTexto: "Lido",
        capa: "https://images-na.ssl-images-amazon.com/images/I/61K-K8T46sL.jpg",
        comentario: "Leitura rápida, muito visual e inspiradora para processos criativos."
    },
    {
        id: 4,
        titulo: "Foco Roubado",
        autor: "Johann Hari",
        status: "quero-ler",
        statusTexto: "Próxima Leitura",
        capa: "https://images-na.ssl-images-amazon.com/images/I/71XmepIuYGL.jpg",
        comentario: "Escolha do grupo para debater sobre atenção e redes sociais no próximo mês."
    }
];

const container = document.getElementById('books-container');
const botoesFiltro = document.querySelectorAll('.filter-btn');

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
            renderizarLivros(livros);
        } else {
            const livrosFiltrados = livros.filter(livro => livro.status === filtroSelecionado);
            renderizarLivros(livrosFiltrados);
        }
    });
});

// Inicializa a página exibindo todos os livros
document.addEventListener('DOMContentLoaded', () => {
    renderizarLivros(livros);
});