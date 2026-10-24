/**
 * SparkEV Core Portal Scripts (Light Pink & White Theme)
 * Theme toggle completely removed.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initCopyButtons();
  initScrollSpy();
  initSearch();
});

// Mobile Drawer Menu
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

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
    if (pre.parentElement.classList.contains('code-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper relative group my-4';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const button = document.createElement('button');
    button.className = 'copy-btn flex items-center gap-1.5';
    button.innerHTML = '<i class="far fa-copy"></i><span>Copy</span>';

    button.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.innerText || pre.innerText;
      try {
        await navigator.clipboard.writeText(code);
        button.innerHTML = '<i class="fas fa-check text-rose-600"></i><span class="text-rose-600">Copied!</span>';
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

// ScrollSpy for Table of Contents
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
        link.classList.add('text-rose-600', 'font-bold', 'border-l-2', 'border-rose-500', 'pl-2', 'bg-pink-50/80');
        link.classList.remove('text-slate-600');
      } else {
        link.classList.remove('text-rose-600', 'font-bold', 'border-l-2', 'border-rose-500', 'pl-2', 'bg-pink-50/80');
        link.classList.add('text-slate-600');
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
