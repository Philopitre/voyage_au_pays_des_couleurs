// Navigation functionality
document.addEventListener('DOMContentLoaded', function () {
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const navMenu = document.getElementById('navMenu');

  // Vérification que les éléments existent
  if (!mobileMenuToggle || !navMenu) {
    console.error('Elements du menu burger non trouvés');
    return;
  }

  // Mobile menu toggle functionality
  mobileMenuToggle.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Menu burger cliqué'); // Debug
    
    this.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    console.log('Classes après toggle:', {
      burger: this.classList.contains('active'),
      menu: navMenu.classList.contains('active')
    }); // Debug
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', function (e) {
    if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
      mobileMenuToggle.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });

  // Close mobile menu when clicking on a nav link
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      mobileMenuToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Tooltip functionality for citation links
  const citationLinks = document.querySelectorAll('.citation-link');
  citationLinks.forEach(link => {
    link.addEventListener('mouseenter', function () {
      const citation = this.getAttribute('data-citation');
      if (citation) {
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'citation-tooltip';
        tooltip.textContent = citation;
        tooltip.style.cssText = `
          position: absolute;
          background: #333;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.9em;
          max-width: 300px;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        `;

        document.body.appendChild(tooltip);

        // Position tooltip
        const rect = this.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.bottom + 8) + 'px';

        // Fade in
        setTimeout(() => tooltip.style.opacity = '1', 10);

        // Store reference
        this._tooltip = tooltip;
      }
    });

    link.addEventListener('mouseleave', function () {
      if (this._tooltip) {
        this._tooltip.remove();
        this._tooltip = null;
      }
    });
  });
});
