<p align="center">
  <img src="https://i.imgur.com/d6K1guA.png" alt="Imagem 1" width="300" />
  <img src="https://i.imgur.com/Niq2q5B.png" alt="Imagem 2" width="300" />
</p>

Tecnologias usadas:

- Javascript.
- TailwindCSS.
- html.
- API do TabNews.

#

Usado API do TabNews, segui filtrando minhas publicações https://www.tabnews.com.br/api/v1/contents/JeielLimaMiranda. Pois há comentários, não é isso que queremos. Então será filtrado apenas o título e a data para sabermos quando foi publicado.

```
.filter(post => post.status === 'published' && post.title && post.published_at)                      
```

Imagine carregar, mais de 20 posts numa aba só. Por esse motivo resolvir limitar 5 posts.

```
 let visiblePosts = 5;
```

Caso usuário queira exibir mais, é possível liberar um adicional de 5, até que todos os post sejam exibidos.

```
loadMoreButton.addEventListener('click', () => {
    visiblePosts += 5;
    renderPosts();
});
```

Também inclui uma barra de pesquisa. Melhor quando se há vários posts/artigos.

```
// Função para filtrar posts pela pesquisa
function filterPosts() {
    const query = searchInput.value.toLowerCase();
    const filteredPosts = posts.filter(post => post.title.toLowerCase().includes(query));
    postsList.innerHTML = '';
    filteredPosts.forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'mb-6 p-6 bg-white shadow-lg rounded-lg transition-transform transform hover:scale-105';
        postElement.innerHTML = `
            <h2 class="text-2xl font-semibold mb-2">
                <a href="#" class="text-blue-600 hover:underline post-link" data-slug="${post.slug}">${post.title}</a>
            </h2>
            <p class="text-gray-500">${new Date(post.published_at).toLocaleDateString()}</p>
        `;
        postsList.appendChild(postElement);
    });
```

Como na API as datas não estão em ordem, é preciso criar uma lógica para isso. No meu caso, é data mais recente para mais antiga.

```
.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
```

Por fim, inserir a tag footer, como todo site tem com informações sobre.

```
<!-- Menu de informações -->
<footer class="bg-gray-800 text-white p-4 mt-6">
    <div class="container mx-auto flex justify-between items-center">
        <p>&copy; 2024 Jeiel - Todos os direitos reservados.</p>
        <div>
            <a href="https://www.linkedin.com/in/jeiel-lima-miranda" class="text-blue-400 hover:underline">LinkedIn</a> |
            <a href="https://github.com/Jetrom17" class="text-blue-400 hover:underline">GitHub</a> |
            <a href="http://jeiel.pages.dev/" class="text-blue-400 hover:underline">Link Bio</a>
            |
            <a href="http://quiz-jeiel.vercel.app/" class="text-blue-400 hover:underline">Quiz Bíblico</a>
        </div>
    </div>
</footer>
```

Em resumo, este projeto não apenas demonstra a aplicação em JavaScript, HTML e CSS, mas também destaca a importância de uma interface de usuário bem projetada e funcional para My Blog. Através da utilização da API do TabNews, consegui criar uma plataforma que facilita o acesso e a interação com minhas publicações, proporcionando uma experiência agradável para os usuários.