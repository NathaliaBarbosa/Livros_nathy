// Base de dados local com as informações dos livros
// =========================================
// BASE DE DADOS INICIAL DOS LIVROS
// ALTERADO
// =========================================

const livrosIniciais = [
    {
        id: 1,
        titulo: "Torto Arado",
        autor: "Itamar Vieira Junior",
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
        titulo: "Inferno",
        autor: "Dan Brown",
        status: "quero-ler",
        statusTexto: "Próxima Leitura",
        comentario: "Escolha do grupo para debater sobre atenção e redes sociais no próximo mês."
    },
    {
        id: 5,
        titulo: "Novembro, 9",
        autor: "Collen Hoover",
        status: "lido",
        statusTexto: "Próxima Leitura",
        comentario: "Escolha do grupo para debater sobre atenção e redes sociais no próximo mês."
    }
];

// NOVO
// Recupera os livros salvos anteriormente.
// Se não existir nenhum livro salvo,
// utiliza os livros iniciais.
let livrosBase = JSON.parse(localStorage.getItem('livros')) || livrosIniciais;

// Variável para guardar os livros depois de buscar as imagens da API
let livrosEnriquecidos = [];

// Elementos do HTML
// Lorem Ipsum
const container = document.getElementById('books-container');
const botoesFiltro = document.querySelectorAll('.filter-btn');

// =========================================
// ELEMENTOS DO FORMULÁRIO
// NOVO
// =========================================

const btnAdicionarLivro = document.getElementById('btn-adicionar-livro');
const formularioLivro = document.getElementById('formulario-livro');
const formLivro = document.getElementById('form-livro');
const btnCancelarLivro = document.getElementById('btn-cancelar-livro');


// =========================================
// SALVAR LIVROS NO LOCALSTORAGE
// NOVO
// =========================================

function salvarLivros() {
    localStorage.setItem('livros', JSON.stringify(livrosBase));
}

// =========================================
// ABRIR FORMULÁRIO
// NOVO
// =========================================

btnAdicionarLivro.addEventListener('click', () => {
    formularioLivro.classList.toggle('hidden');
});

// =========================================
// CANCELAR CADASTRO
// NOVO
// =========================================

btnCancelarLivro.addEventListener('click', () => {
    formularioLivro.classList.add('hidden');
    formLivro.reset();
});

// =========================================
// CADASTRAR NOVO LIVRO
// NOVO
// =========================================

formLivro.addEventListener('submit', async (evento) => {

    // Impede o recarregamento da página
    evento.preventDefault();

    // Captura os dados preenchidos pelo usuário
    const titulo = document.getElementById('titulo').value.trim();
    const autor = document.getElementById('autor').value.trim();
    const status = document.getElementById('status').value;
    const comentario = document.getElementById('comentario').value.trim();

    // Define o texto que será exibido no card
    const statusTextoMap = {
        'lido': 'Lido',
        'lendo': 'Lendo Atualmente',
        'quero-ler': 'Próxima Leitura'
    };

    // Cria o novo livro
    const novoLivro = {
        id: Date.now(),
        titulo,
        autor,
        status,
        statusTexto: statusTextoMap[status],
        comentario
    };

    // Adiciona o livro à lista principal
    livrosBase.push(novoLivro);

    // Salva a lista atualizada no localStorage
    salvarLivros();

    // Limpa o formulário
    formLivro.reset();

    // Esconde o formulário
    formularioLivro.classList.add('hidden');

    // IMPORTANTE:
    // Busca novamente as capas usando a lista atualizada
    // de livrosBase.
    await buscarDadosDaAPI();
});

// =========================================
// BUSCAR CAPAS DOS LIVROS NA OPEN LIBRARY
// ALTERADO
// =========================================

async function buscarDadosDaAPI() {

    // Mostra mensagem enquanto as capas são carregadas
    container.innerHTML = `
        <p class="loading">
            Buscando capas no acervo da Open Library... 📚
        </p>
    `;

    // Cria uma requisição para cada livro
    const promessas = livrosBase.map(async (livro) => {

        try {

            // =========================================
            // BUSCA O LIVRO PELO TÍTULO E AUTOR
            // =========================================

            const query = new URLSearchParams({
                title: livro.titulo,
                author: livro.autor
            });

            const url =
                `https://openlibrary.org/search.json?${query.toString()}`;

            console.log('Iniciando busca:', livro.titulo, livro.autor);
            console.log('Resposta recebida:', livro.titulo);
            const resposta = await fetch(url);

            if (!resposta.ok) {
                throw new Error(`Erro HTTP: ${resposta.status}`);
            }

            const dados = await resposta.json();

            console.log(
                `Resultados encontrados para "${livro.titulo}":`,
                dados.docs
            );


            // =========================================
            // PROCURA PRIMEIRO UM RESULTADO COM cover_i
            // =========================================

            let livroEncontrado = dados.docs?.find(
                doc => doc.cover_i
            );


            // =========================================
            // SE NÃO ENCONTROU cover_i,
            // PROCURA UM RESULTADO QUE TENHA ISBN
            // =========================================

            let isbn = null;

            if (!livroEncontrado) {

                const livroComIsbn = dados.docs?.find(
                    doc => doc.isbn && doc.isbn.length > 0
                );

                if (livroComIsbn) {

                    isbn = livroComIsbn.isbn[0];

                    console.log(
                        `Livro "${livro.titulo}" encontrado pelo ISBN:`,
                        isbn
                    );
                }
            }


            // =========================================
            // DEFINE A CAPA PADRÃO
            // =========================================

            let capaUrl =
                'https://via.placeholder.com/280x350.png?text=Capa+Indisponível';


            // =========================================
            // OPÇÃO 1
            // CAPA ENCONTRADA PELO cover_i
            // =========================================

            if (livroEncontrado?.cover_i) {

                const coverId =
                    livroEncontrado.cover_i;

                capaUrl =
                    `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;

                console.log(
                    `Capa encontrada para "${livro.titulo}" pelo cover_i:`,
                    capaUrl
                );
            }


            // =========================================
            // OPÇÃO 2
            // CAPA ENCONTRADA PELO ISBN
            // =========================================

            else if (isbn) {

                capaUrl =
                    `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

                console.log(
                    `Capa encontrada para "${livro.titulo}" pelo ISBN:`,
                    capaUrl
                );
            }


            // =========================================
            // SE NÃO ENCONTROU NENHUMA CAPA
            // =========================================

            else {

                console.warn(
                    `Nenhuma capa encontrada para "${livro.titulo}" - ${livro.autor}`
                );
            }


            // =========================================
            // RETORNA O LIVRO COM A CAPA
            // =========================================

            return {
                ...livro,
                capa: capaUrl
            };


        } catch (erro) {

            console.error(
                `Erro ao buscar capa de "${livro.titulo}":`,
                erro
            );

            return {
                ...livro,
                capa:
                    'https://via.placeholder.com/280x350.png?text=Erro+de+Conexão'
            };
        }
    });


    // =========================================
    // AGUARDA TODAS AS REQUISIÇÕES
    // =========================================

    livrosEnriquecidos =
        await Promise.all(promessas);


    // =========================================
    // RENDERIZA OS LIVROS
    // =========================================

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

// =========================================
// INICIALIZAÇÃO DA PÁGINA
// ALTERADO
// =========================================

buscarDadosDaAPI();