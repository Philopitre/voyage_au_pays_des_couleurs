// JavaScript principal optimisé - Philow
// Navigation et fonctionnalités communes

/**
 * Utilitaires
 */
const Utils = {
  // Debounce pour optimiser les performances
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Smooth scroll
  smoothScrollTo(target, offset = 0) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  },

  // Vérifier si un élément est visible
  isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.left >= 0 && 
           rect.bottom <= window.innerHeight && 
           rect.right <= window.innerWidth;
  }
};

/**
 * Gestion de la navigation
 */
class Navigation {
  constructor() {
    this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
    this.navMenu = document.getElementById('navMenu');
    this.navLinks = document.querySelectorAll('.nav-link');
    
    this.init();
  }

  init() {
    if (!this.mobileMenuToggle || !this.navMenu) {
      console.warn('Éléments de navigation non trouvés');
      return;
    }

    this.bindEvents();
    this.handleActiveLink();
  }

  bindEvents() {
    // Toggle menu mobile
    this.mobileMenuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleMobileMenu();
    });

    // Fermer le menu en cliquant à l'extérieur
    document.addEventListener('click', (e) => {
      if (!this.navMenu.contains(e.target) && !this.mobileMenuToggle.contains(e.target)) {
        this.closeMobileMenu();
      }
    });

    // Fermer le menu lors du clic sur un lien
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });

    // Fermer avec Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMobileMenu();
      }
    });
  }

  toggleMobileMenu() {
    this.mobileMenuToggle.classList.toggle('active');
    this.navMenu.classList.toggle('active');
    
    // Accessibilité
    const isExpanded = this.navMenu.classList.contains('active');
    this.mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
  }

  closeMobileMenu() {
    this.mobileMenuToggle.classList.remove('active');
    this.navMenu.classList.remove('active');
    this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
  }

  handleActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}

/**
 * Gestion du lecteur podcast
 */
class PodcastPlayer {
  constructor() {
    this.episodeSelector = document.getElementById('previousEpisodes');
    this.listenButton = document.getElementById('listenPrevious');
    
    this.init();
  }

  init() {
    if (!this.episodeSelector || !this.listenButton) {
      return; // Pas de lecteur sur cette page
    }

    this.bindEvents();
  }

  bindEvents() {
    this.episodeSelector.addEventListener('change', () => {
      const selectedUrl = this.episodeSelector.value;
      
      if (selectedUrl) {
        this.listenButton.style.display = 'inline-block';
        this.listenButton.onclick = () => {
          this.openEpisode(selectedUrl);
        };
      } else {
        this.listenButton.style.display = 'none';
      }
    });
  }

  openEpisode(url) {
    // Ouvrir dans un nouvel onglet avec les bonnes pratiques de sécurité
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (!newWindow) {
      // Fallback si le popup est bloqué
      window.location.href = url;
    }
  }
}

/**
 * Gestion des tooltips pour les citations
 */
class CitationTooltips {
  constructor() {
    this.citationLinks = document.querySelectorAll('.citation-link');
    this.activeTooltip = null;
    
    this.init();
  }

  init() {
    if (this.citationLinks.length === 0) {
      return; // Pas de citations sur cette page
    }

    this.bindEvents();
  }

  bindEvents() {
    this.citationLinks.forEach(link => {
      link.addEventListener('mouseenter', (e) => {
        this.showTooltip(e.target);
      });

      link.addEventListener('mouseleave', (e) => {
        this.hideTooltip(e.target);
      });

      // Support tactile
      link.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.showTooltip(e.target);
        
        // Masquer après 3 secondes sur mobile
        setTimeout(() => {
          this.hideTooltip(e.target);
        }, 3000);
      });
    });
  }

  showTooltip(element) {
    const citation = element.getAttribute('data-citation');
    if (!citation) return;

    // Supprimer le tooltip existant
    this.hideTooltip(element);

    // Créer le nouveau tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'citation-tooltip';
    tooltip.textContent = citation;
    
    document.body.appendChild(tooltip);

    // Positionner le tooltip
    this.positionTooltip(tooltip, element);

    // Animation d'apparition
    requestAnimationFrame(() => {
      tooltip.style.opacity = '1';
    });

    // Stocker la référence
    element._tooltip = tooltip;
    this.activeTooltip = tooltip;
  }

  hideTooltip(element) {
    if (element._tooltip) {
      element._tooltip.remove();
      element._tooltip = null;
    }
    this.activeTooltip = null;
  }

  positionTooltip(tooltip, element) {
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let left = rect.left + window.pageXOffset;
    let top = rect.bottom + window.pageYOffset + 8;

    // Ajuster si le tooltip dépasse à droite
    if (left + tooltipRect.width > window.innerWidth) {
      left = window.innerWidth - tooltipRect.width - 10;
    }

    // Ajuster si le tooltip dépasse à gauche
    if (left < 10) {
      left = 10;
    }

    // Ajuster si le tooltip dépasse en bas
    if (top + tooltipRect.height > window.innerHeight + window.pageYOffset) {
      top = rect.top + window.pageYOffset - tooltipRect.height - 8;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }
}

/**
 * Gestion du lazy loading et des animations
 */
class LazyLoader {
  constructor() {
    this.observer = null;
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    }
  }

  setupIntersectionObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: '50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.handleIntersection(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    // Observer les éléments qui ont besoin de lazy loading
    const lazyElements = document.querySelectorAll('.feature-card, .info-card, .blog-card');
    lazyElements.forEach(element => {
      this.observer.observe(element);
    });
  }

  handleIntersection(element) {
    // Ajouter une classe pour les animations CSS
    element.classList.add('loaded');
    
    // Animation d'apparition personnalisée
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    });
  }
}

/**
 * Gestion des performances et optimisations
 */
class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    this.preloadCriticalResources();
    this.optimizeScrollEvents();
    this.setupServiceWorkerIfAvailable();
  }

  preloadCriticalResources() {
    // Précharger les ressources critiques
    const criticalResources = [
      { href: 'assets/css/blog.css', as: 'style' },
      { href: 'assets/js/blog.js', as: 'script' }
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      
      // Ajouter seulement si la ressource n'existe pas déjà
      const existingLink = document.querySelector(`link[href="${resource.href}"]`);
      if (!existingLink) {
        document.head.appendChild(link);
      }
    });
  }

  optimizeScrollEvents() {
    // Optimiser les événements de scroll avec debounce
    const debouncedScrollHandler = Utils.debounce(() => {
      // Actions à effectuer lors du scroll
      this.handleScroll();
    }, 10);

    window.addEventListener('scroll', debouncedScrollHandler, { passive: true });
  }

  handleScroll() {
    // Gérer les barres de progression, animations au scroll, etc.
    const scrollPercent = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    
    // Émettre un événement personnalisé pour d'autres modules
    document.dispatchEvent(new CustomEvent('optimizedScroll', {
      detail: { scrollPercent }
    }));
  }

  setupServiceWorkerIfAvailable() {
    // Configuration basique d'un service worker pour la mise en cache
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }
}

/**
 * Gestionnaire principal de l'application
 */
class PhilowApp {
  constructor() {
    this.modules = {};
    this.init();
  }

  init() {
    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeModules();
      });
    } else {
      this.initializeModules();
    }
  }

  initializeModules() {
    try {
      // Initialiser les modules principaux
      this.modules.navigation = new Navigation();
      this.modules.podcastPlayer = new PodcastPlayer();
      this.modules.citationTooltips = new CitationTooltips();
      this.modules.lazyLoader = new LazyLoader();
      this.modules.performanceOptimizer = new PerformanceOptimizer();

      // Initialiser les modules spécifiques aux pages
      this.initializePageSpecificModules();

      console.log('✅ Philow App initialisée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
    }
  }

  initializePageSpecificModules() {
    // Initialiser les modules spécifiques selon la page
    const currentPage = this.getCurrentPage();
    
    switch (currentPage) {
      case 'blog.html':
        // Le module blog sera chargé séparément
        this.loadBlogModule();
        break;
      case 'sessions.html':
        this.initializeSessionsModule();
        break;
      case 'contact.html':
        this.initializeContactModule();
        break;
      default:
        this.initializeHomeModule();
    }
  }

  getCurrentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  loadBlogModule() {
    // Chargement dynamique du module blog
    if (typeof BlogManager === 'undefined') {
      const script = document.createElement('script');
      script.src = 'assets/js/blog.js';
      script.onload = () => {
        this.modules.blog = new BlogManager();
      };
      document.head.appendChild(script);
    }
  }

  initializeSessionsModule() {
    // Fonctionnalités spécifiques à la page sessions
    this.initializeSessionCountdown();
    this.initializeSessionCalendar();
  }

  initializeContactModule() {
    // Fonctionnalités spécifiques à la page contact
    this.initializeContactForm();
  }

  initializeHomeModule() {
    // Fonctionnalités spécifiques à la page d'accueil
    this.initializeHeroAnimations();
  }

  initializeSessionCountdown() {
    // Compte à rebours pour la prochaine session
    const nextSessionDate = new Date('2025-08-23T22:00:00');
    const countdownElement = document.querySelector('.session-countdown');
    
    if (countdownElement) {
      const updateCountdown = () => {
        const now = new Date();
        const timeLeft = nextSessionDate - now;
        
        if (timeLeft > 0) {
          const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          
          countdownElement.textContent = `${days}j ${hours}h ${minutes}m`;
        } else {
          countdownElement.textContent = 'Session en cours !';
        }
      };
      
      updateCountdown();
      setInterval(updateCountdown, 60000); // Mise à jour chaque minute
    }
  }

  initializeSessionCalendar() {
    // Gestion du calendrier des sessions
    const sessionCards = document.querySelectorAll('.session-card');
    
    sessionCards.forEach(card => {
      card.addEventListener('click', () => {
        // Animation de clic
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
          card.style.transform = '';
        }, 150);
      });
    });
  }

  initializeContactForm() {
    // Amélioration de l'accessibilité du formulaire de contact
    const contactLinks = document.querySelectorAll('.contact-link');
    
    contactLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Analytics ou tracking si nécessaire
        this.trackContactClick(link.href);
      });
    });
  }

  initializeHeroAnimations() {
    // Animations pour la section hero de la page d'accueil
    const heroElements = document.querySelectorAll('.intro-section, .features-grid');
    
    heroElements.forEach((element, index) => {
      setTimeout(() => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        requestAnimationFrame(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        });
      }, index * 200);
    });
  }

  trackContactClick(href) {
    // Placeholder pour le tracking des clics
    console.log('Contact click tracked:', href);
  }

  // Méthode utilitaire pour nettoyer les modules
  destroy() {
    Object.values(this.modules).forEach(module => {
      if (module && typeof module.destroy === 'function') {
        module.destroy();
      }
    });
  }
}

// Initialisation globale
window.PhilowApp = new PhilowApp();

// Exposition des utilitaires pour d'autres scripts
window.PhilowUtils = Utils;