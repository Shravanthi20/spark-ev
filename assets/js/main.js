/**
 * SparkEV Portal Core Scripts
 * Handles Theme Toggling, Navigation, Code Copying, and Quick Search
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initCopyButtons();
  initScrollSpy();
  initSearch();
});

// Theme Management
function initThemeToggle() {
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const savedTheme = localStorage.getItem('sparkev-theme') || 'dark';

  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    updateThemeIcons(true);
  } else {
    document.body.classList.remove('light-theme');
    updateThemeIcons(false);
  }

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-theme');
      localStorage.setItem('sparkev-theme', isLight ? 'light' : 'dark');
      updateThemeIcons(isLight);
    });
  });
}

function updateThemeIcons(isLight) {
  const icons = document.querySelectorAll('.theme-toggle-icon');
  icons.forEach(icon => {
    if (isLight) {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    } else {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    }
  });
}

// Mobile Menu
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Close on navigation
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }
}

// Code Copy Buttons
function initCopyButtons() {
  document.querySelectorAll('pre').forEach(pre => {
    // Avoid double wrapper
    if (pre.parentElement.classList.contains('code-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper relative group my-4';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const button = document.createElement('button');
    button.className = 'copy-btn opacity-80 hover:opacity-100 flex items-center gap-1.5';
    button.innerHTML = '<i class="far fa-copy"></i><span>Copy</span>';

    button.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.innerText || pre.innerText;
      try {
        await navigator.clipboard.writeText(code);
        button.innerHTML = '<i class="fas fa-check text-emerald-400"></i><span class="text-emerald-400">Copied!</span>';
        setTimeout(() => {
          button.innerHTML = '<i class="far fa-copy"></i><span>Copy</span>';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    });

    wrapper.appendChild(button);
  });
}

// Scrollspy for TOC
function initScrollSpy() {
  const tocLinks = document.querySelectorAll('.toc-link');
  if (tocLinks.length === 0) return;

  const sections = Array.from(tocLinks).map(link => {
    const id = link.getAttribute('href').replace('#', '');
    return document.getElementById(id);
  }).filter(Boolean);

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      if (section.offsetTop <= scrollPos) {
        currentId = section.getAttribute('id');
      }
    });

    tocLinks.forEach(link => {
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('text-cyan-400', 'font-semibold', 'border-l-2', 'border-cyan-400', 'pl-2');
        link.classList.remove('text-slate-400');
      } else {
        link.classList.remove('text-cyan-400', 'font-semibold', 'border-l-2', 'border-cyan-400', 'pl-2');
        link.classList.add('text-slate-400');
      }
    });
  });
}

// Quick Search across documentation
function initSearch() {
  const searchInput = document.getElementById('doc-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const articles = document.querySelectorAll('.searchable-content');

    articles.forEach(article => {
      const text = article.innerText.toLowerCase();
      if (query === '' || text.includes(query)) {
        article.classList.remove('hidden');
      } else {
        article.classList.add('hidden');
      }
    });
  });
}
