// Main application logic

class BlogApp {
    constructor() {
        this.currentFilter = 'recent';
        this.currentPage = 1;
        this.allPosts = [];
        this.isLoading = false;
        this.hasMorePosts = true;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPosts();
        this.setupNewsletterAlert();
    }

    setupEventListeners() {
        // Filter buttons
        const recentBtn = document.getElementById('filter-recent');
        const topBtn = document.getElementById('filter-top');
        
        if (recentBtn) {
            recentBtn.addEventListener('click', () => this.setFilter('recent'));
        }
        
        if (topBtn) {
            topBtn.addEventListener('click', () => this.setFilter('top'));
        }

        // Load more button
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMore());
        }

        // Modal close
        const modalClose = document.getElementById('modal-close');
        const modal = document.getElementById('post-modal');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    setupNewsletterAlert() {
        const closeBtn = document.getElementById('newsletter-close');
        const alert = document.getElementById('newsletter-alert');
        
        if (closeBtn && alert) {
            closeBtn.addEventListener('click', () => {
                alert.style.display = 'none';
            });
        }
    }

    setFilter(filter) {
        if (this.currentFilter === filter) return;
        
        this.currentFilter = filter;
        this.currentPage = 1;
        this.allPosts = [];
        this.hasMorePosts = true;
        
        this.updateFilterButtons();
        this.updatePostsHeader();
        this.loadPosts();
    }

    updateFilterButtons() {
        const recentBtn = document.getElementById('filter-recent');
        const topBtn = document.getElementById('filter-top');
        
        if (recentBtn && topBtn) {
            if (this.currentFilter === 'recent') {
                recentBtn.className = 'px-4 py-2 text-sm font-medium rounded-md transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm';
                topBtn.className = 'px-4 py-2 text-sm font-medium rounded-md transition-all text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white';
            } else {
                topBtn.className = 'px-4 py-2 text-sm font-medium rounded-md transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm';
                recentBtn.className = 'px-4 py-2 text-sm font-medium rounded-md transition-all text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white';
            }
        }
    }

    updatePostsHeader() {
        const icon = document.getElementById('posts-icon');
        const text = document.getElementById('posts-header-text');
        
        if (icon && text) {
            if (this.currentFilter === 'recent') {
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"></path>';
                text.textContent = 'Posts mais recentes';
            } else {
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>';
                text.textContent = 'Posts mais populares';
            }
        }
    }

    async loadPosts() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            const posts = await window.API.fetchPosts(this.currentFilter, this.currentPage);
            
            if (this.currentPage === 1) {
                this.allPosts = posts;
            } else {
                // Remove duplicates
                const existingIds = new Set(this.allPosts.map(post => post.id));
                const newPosts = posts.filter(post => !existingIds.has(post.id));
                this.allPosts = [...this.allPosts, ...newPosts];
            }
            
            this.hasMorePosts = posts.length === 10;
            this.renderPosts();
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showError();
        } finally {
            this.isLoading = false;
        }
    }

    loadMore() {
        if (!this.hasMorePosts || this.isLoading) return;
        
        this.currentPage++;
        this.loadPosts();
    }

    showLoading() {
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        const grid = document.getElementById('posts-grid');
        
        if (this.currentPage === 1) {
            loading?.classList.remove('hidden');
            error?.classList.add('hidden');
            grid?.classList.add('hidden');
        }
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        const grid = document.getElementById('posts-grid');
        
        loading?.classList.add('hidden');
        grid?.classList.remove('hidden');
    }

    showError() {
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        const grid = document.getElementById('posts-grid');
        
        loading?.classList.add('hidden');
        error?.classList.remove('hidden');
        grid?.classList.add('hidden');
    }

    renderPosts() {
        const grid = document.getElementById('posts-grid');
        const loadMoreContainer = document.getElementById('load-more-container');
        const noMorePosts = document.getElementById('no-more-posts');
        
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.allPosts.forEach((post, index) => {
            const postElement = this.createPostElement(post, index);
            grid.appendChild(postElement);
        });
        
        // Update load more button visibility
        if (loadMoreContainer && noMorePosts) {
            if (this.hasMorePosts && this.allPosts.length > 0) {
                loadMoreContainer.classList.remove('hidden');
                noMorePosts.classList.add('hidden');
            } else if (this.allPosts.length > 0) {
                loadMoreContainer.classList.add('hidden');
                noMorePosts.classList.remove('hidden');
            } else {
                loadMoreContainer.classList.add('hidden');
                noMorePosts.classList.add('hidden');
            }
        }
    }

    createPostElement(post, index) {
        const article = document.createElement('article');
        article.className = 'post-card group p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all cursor-pointer';
        
        const wasUpdated = new Date(post.updated_at) > new Date(post.published_at);
        
        article.innerHTML = `
            <div class="flex-1 min-w-0">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    ${this.escapeHtml(post.title)}
                </h2>
                
                <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div class="flex items-center gap-1">
                        ${wasUpdated ? `
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <time datetime="${post.updated_at}">
                                Atualizado em ${this.formatDate(post.updated_at)}
                            </time>
                        ` : `
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                            </svg>
                            <time datetime="${post.published_at}">
                                Publicado em ${this.formatDate(post.published_at)}
                            </time>
                        `}
                    </div>
                </div>

                <div class="flex items-center gap-4 text-sm">
                    <div class="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        ${post.tabcoins > 6 ? `
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                        ` : ''}
                        <span class="font-medium">${post.tabcoins} tabcoins</span>
                    </div>
                    
                    ${post.children_deep_count > 0 ? `
                        <span class="text-gray-500 dark:text-gray-400">
                            ${post.children_deep_count} comentário${post.children_deep_count !== 1 ? 's' : ''}
                        </span>
                    ` : ''}
                </div>
            </div>
        `;
        
        article.addEventListener('click', () => this.openPost(post));
        
        return article;
    }

    async openPost(post) {
        try {
            // Show modal with loading state
            this.showModal(post.title, 'Carregando conteúdo...', '', '');
            
            // Fetch full post content
            const fullPost = await window.API.fetchPostDetail(post.slug);
            
            // Update modal with full content
            const wasUpdated = new Date(fullPost.updated_at) > new Date(fullPost.published_at);
            
            const metaHtml = `
                <div class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                    <time datetime="${fullPost.published_at}">
                        ${this.formatDate(fullPost.published_at)}
                    </time>
                </div>
                
                <div class="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                    ${fullPost.tabcoins > 7 ? `
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                    ` : ''}
                    <span class="font-medium">${fullPost.tabcoins} tabcoins</span>
                </div>
                
                ${fullPost.children_deep_count > 0 ? `
                    <div class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                        <span>${fullPost.children_deep_count} comentário${fullPost.children_deep_count !== 1 ? 's' : ''}</span>
                    </div>
                ` : ''}
            `;
            
            const content = fullPost.body ? this.parseMarkdown(fullPost.body) : 'Conteúdo não disponível.';
            const originalLink = `https://www.tabnews.com.br/${fullPost.owner_username}/${fullPost.slug}`;
            
            this.showModal(fullPost.title, metaHtml, content, originalLink);
            
        } catch (error) {
            console.error('Error loading post detail:', error);
            this.showModal(post.title, '', 'Erro ao carregar o conteúdo do post. Tente novamente.', '');
        }
    }

    showModal(title, metaHtml, content, originalLink) {
        const modal = document.getElementById('post-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMeta = document.getElementById('modal-meta');
        const modalContent = document.getElementById('modal-content');
        const modalOriginalLink = document.getElementById('modal-original-link');
        
        if (modal && modalTitle && modalMeta && modalContent && modalOriginalLink) {
            modalTitle.textContent = title;
            modalMeta.innerHTML = metaHtml;
            modalContent.innerHTML = content;
            
            if (originalLink) {
                modalOriginalLink.href = originalLink;
                modalOriginalLink.style.display = 'inline-flex';
            } else {
                modalOriginalLink.style.display = 'none';
            }
            
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal() {
        const modal = document.getElementById('post-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    parseMarkdown(markdown) {
        // Simple markdown parser for basic formatting
        let html = this.escapeHtml(markdown);
        
        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Code blocks
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Inline code
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // Line breaks
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');
        
        // Wrap in paragraphs
        html = '<p>' + html + '</p>';
        
        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/g, '');
        
        return html;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.blogApp = new BlogApp();
});