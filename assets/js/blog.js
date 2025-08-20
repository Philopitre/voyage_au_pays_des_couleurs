// JavaScript optimisé pour le blog - Philow
// Gestion des articles, navigation et fonctionnalités spécifiques

/**
 * Gestionnaire principal du blog
 */
class BlogManager {
  constructor() {
    this.blogCards = document.querySelectorAll('.blog-card[data-article]');
    this.fullArticles = document.querySelectorAll('.full-article');
    this.backButtons = document.querySelectorAll('.back-to-blog');
    this.blogGrid = document.querySelector('.blog-grid');
    this.blogMainHeader = document.querySelector('.blog-main-header');
    this.currentArticle = null;
    this.scrollProgress = null;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.initializeScrollProgress();
    this.handleUrlNavigation();
    this.initializeKeyboardNavigation();
    
    console.log('✅ Blog Manager initialisé');
  }

  bindEvents() {
    // Événements pour l'affichage des articles
    this.blogCards.forEach(card => {
      const readMoreBtn = card.querySelector('.read-more-btn');
      if (readMoreBtn) {
        readMoreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const articleId = card.getAttribute('data-article');
          this.showArticle(articleId);
        });
      }
    });

    // Boutons de retour au blog
    this.backButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.showBlogGrid();
      });
    });

    // Gestion des événements de navigation du navigateur
    window.addEventListener('popstate', () => {
      this.handleUrlNavigation();
    });

    // Écouter les événements de scroll optimisés
    document.addEventListener('optimizedScroll', (e) => {
      this.updateScrollProgress(e.detail.scrollPercent);
    });
  }

  /**
   * Afficher un article spécifique
   */
  showArticle(articleId) {
    if (!articleId) return;

    // Masquer la grille du blog
    this.hideElement(this.blogGrid);
    this.hideElement(this.blogMainHeader);
    
    // Masquer tous les articles
    this.fullArticles.forEach(article => {
      article.classList.add('hidden');
    });
    
    // Afficher l'article sélectionné
    const targetArticle = document.getElementById(`article-${articleId}`);
    if (targetArticle) {
      this.currentArticle = targetArticle;
      targetArticle.classList.remove('hidden');
      
      // Scroll vers le haut avec animation
      this.scrollToTop();
      
      // Mettre à jour l'URL
      this.updateUrl(articleId);
      
      // Initialiser la barre de progression
      this.initializeArticleScrollProgress(targetArticle);
      
      // Analytics
      this.trackArticleView(articleId);
      
      // Améliorer l'accessibilité
      this.updateAccessibility('article');
    }
  }

  /**
   * Afficher la grille du blog
   */
  showBlogGrid() {
    // Afficher la grille du blog
    this.showElement(this.blogGrid);
    this.showElement(this.blogMainHeader);
    
    // Masquer tous les articles
    this.fullArticles.forEach(article => {
      article.classList.add('hidden');
    });
    
    this.currentArticle = null;
    
    // Scroll vers le haut
    this.scrollToTop();
    
    // Mettre à jour l'URL
    this.updateUrl();
    
    // Supprimer la barre de progression
    this.removeScrollProgress();
    
    // Améliorer l'accessibilité
    this.updateAccessibility('grid');
  }

  /**
   * Gestion de la navigation par URL
   */
  handleUrlNavigation() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleParam = urlParams.get('article');
    
    if (articleParam) {
      const targetArticle = document.getElementById(`article-${articleParam}`);
      if (targetArticle) {
        this.showArticle(articleParam);
      } else {
        // Article non trouvé, retourner à la grille
        this.showBlogGrid();
      }
    } else {
      this.showBlogGrid();
    }
  }

  /**
   * Mettre à jour l'URL
   */
  updateUrl(articleId = null) {
    const url = new URL(window.location);
    
    if (articleId) {
      url.searchParams.set('article', articleId);
    } else {
      url.searchParams.delete('article');
    }
    
    // Utiliser replaceState pour ne pas ajouter à l'historique lors du chargement initial
    const method = this.currentArticle ? 'pushState' : 'replaceState';
    window.history[method]({}, '', url);
  }

  /**
   * Navigation au clavier
   */
  initializeKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // ESC pour retourner à la grille
      if (e.key === 'Escape' && this.currentArticle) {
        this.showBlogGrid();
      }
      
      // Flèches pour naviguer entre les articles
      if (this.currentArticle) {
        if (e.key === 'ArrowLeft') {
          this.navigateToPreviousArticle();
        } else if (e.key === 'ArrowRight') {
          this.navigateToNextArticle();
        }
      }
    });
  }

  /**
   * Navigation entre articles
   */
  navigateToPreviousArticle() {
    const articles = Array.from(this.blogCards);
    const currentIndex = articles.findIndex(card => 
      card.getAttribute('data-article') === this.getCurrentArticleId()
    );
    
    if (currentIndex > 0) {
      const prevArticleId = articles[currentIndex - 1].getAttribute('data-article');
      this.showArticle(prevArticleId);
    }
  }

  navigateToNextArticle() {
    const articles = Array.from(this.blogCards);
    const currentIndex = articles.findIndex(card => 
      card.getAttribute('data-article') === this.getCurrentArticleId()
    );
    
    if (currentIndex < articles.length - 1) {
      const nextArticleId = articles[currentIndex + 1].getAttribute('data-article');
      this.showArticle(nextArticleId);
    }
  }

  getCurrentArticleId() {
    return this.currentArticle ? 
           this.currentArticle.id.replace('article-', '') : 
           null;
  }

  /**
   * Barre de progression de lecture
   */
  initializeScrollProgress() {
    // Créer la barre de progression globale si elle n'existe pas
    if (!document.querySelector('.scroll-progress')) {
      this.scrollProgress = document.createElement('div');
      this.scrollProgress.className = 'scroll-progress';
      document.body.appendChild(this.scrollProgress);
    }
  }

  initializeArticleScrollProgress(article) {
    // Barre de progression spécifique à l'article
    let progressBar = article.querySelector('.scroll-progress');
    
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress';
      article.appendChild(progressBar);
    }
  }

  updateScrollProgress(scrollPercent) {
    if (this.currentArticle) {
      const progressBar = this.currentArticle.querySelector('.scroll-progress');
      if (progressBar) {
        progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
      }
    }
  }

  removeScrollProgress() {
    this.fullArticles.forEach(article => {
      const progressBar = article.querySelector('.scroll-progress');
      if (progressBar) {
        progressBar.style.width = '0%';
      }
    });
  }

  /**
   * États de chargement
   */
  showLoadingState() {
    const loader = document.createElement('div');
    loader.className = 'loading-spinner';
    loader.innerHTML = '⟳';
    loader.setAttribute('aria-label', 'Chargement en cours');
    
    document.body.appendChild(loader);
    return loader;
  }

  hideLoadingState(loader) {
    if (loader && loader.parentNode) {
      loader.parentNode.removeChild(loader);
    }
  }

  /**
   * Transitions avec état de chargement
   */
  showArticleWithLoading(articleId) {
    const loader = this.showLoadingState();
    
    // Simulation d'un petit délai pour une transition smooth
    setTimeout(() => {
      this.showArticle(articleId);
      this.hideLoadingState(loader);
    }, 200);
  }

  /**
   * Utilitaires d'animation
   */
  hideElement(element) {
    if (element) {
      element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      element.style.opacity = '0';
      element.style.transform = 'translateY(-20px)';
      
      setTimeout(() => {
        element.style.display = 'none';
      }, 300);
    }
  }

  showElement(element) {
    if (element) {
      element.style.display = '';
      element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      
      requestAnimationFrame(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      });
    }
  }

  scrollToTop() {
    if (window.PhilowUtils) {
      window.PhilowUtils.smoothScrollTo(document.body, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Accessibilité
   */
  updateAccessibility(mode) {
    // Mettre à jour les attributs ARIA et le focus
    if (mode === 'article') {
      document.body.setAttribute('data-blog-mode', 'article');
      
      // Focus sur le titre de l'article
      if (this.currentArticle) {
        const articleTitle = this.currentArticle.querySelector('h1');
        if (articleTitle) {
          articleTitle.setAttribute('tabindex', '-1');
          articleTitle.focus();
        }
      }
    } else {
      document.body.setAttribute('data-blog-mode', 'grid');
      
      // Focus sur le titre principal du blog
      if (this.blogMainHeader) {
        const mainTitle = this.blogMainHeader.querySelector('h1');
        if (mainTitle) {
          mainTitle.setAttribute('tabindex', '-1');
          mainTitle.focus();
        }
      }
    }
  }

  /**
   * Analytics et tracking
   */
  trackArticleView(articleId) {
    // Placeholder pour le tracking des vues d'articles
    console.log(`📊 Article vu: ${articleId}`);
    
    // Ici vous pourriez intégrer Google Analytics, Matomo, etc.
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: `Article: ${articleId}`,
        page_location: window.location.href
      });
    }
  }

  /**
   * Gestion des erreurs
   */
  handleError(error, context) {
    console.error(`❌ Erreur dans le blog (${context}):`, error);
    
    // Afficher un message d'erreur user-friendly
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
      <p>Une erreur s'est produite. Veuillez rafraîchir la page.</p>
      <button onclick="window.location.reload()">Rafraîchir</button>
    `;
    
    document.body.appendChild(errorMessage);
    
    setTimeout(() => {
      errorMessage.remove();
    }, 5000);
  }

  /**
   * Optimisations de performance
   */
  preloadNextArticle() {
    // Précharger l'article suivant pour une navigation plus rapide
    const articles = Array.from(this.blogCards);
    const currentIndex = articles.findIndex(card => 
      card.getAttribute('data-article') === this.getCurrentArticleId()
    );
    
    if (currentIndex < articles.length - 1) {
      const nextArticleId = articles[currentIndex + 1].getAttribute('data-article');
      const nextArticle = document.getElementById(`article-${nextArticleId}`);
      
      if (nextArticle) {
        // Précharger les images de l'article suivant
        const images = nextArticle.querySelectorAll('img[data-src]');
        images.forEach(img => {
          img.src = img.getAttribute('data-src');
        });
      }
    }
  }

  /**
   * Partage social
   */
  initializeSocialSharing() {
    // Ajouter des boutons de partage si nécessaire
    const shareButtons = document.querySelectorAll('.share-button');
    
    shareButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const platform = button.getAttribute('data-platform');
        const url = window.location.href;
        const title = document.title;
        
        this.shareOn(platform, url, title);
      });
    });
  }

  shareOn(platform, url, title) {
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  }

  /**
   * Nettoyage
   */
  destroy() {
    // Nettoyer les event listeners et les éléments créés
    this.removeScrollProgress();
    
    if (this.scrollProgress) {
      this.scrollProgress.remove();
    }
    
    console.log('🧹 Blog Manager nettoyé');
  }
}

// Exporter pour utilisation globale
window.BlogManager = BlogManager;