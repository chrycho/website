const publicationList = document.querySelector('.publication-list');

const scholarSearch = (title) => `https://scholar.google.com/scholar?q=${encodeURIComponent(`"${title}"`)}`;

publicationList.innerHTML = window.publications.map(([year, category, title, authors, journal, url]) => `
  <a class="publication reveal" data-category="${category}" href="${url || scholarSearch(title)}"
    target="_blank" rel="noopener">
    <span class="pub-year">${year}</span>
    <div>
      <h3>${title}</h3>
      <p>${authors} · ${journal}</p>
    </div>
    <span class="arrow" aria-hidden="true">↗</span>
  </a>
`).join('');

const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');

menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector('.filter.active').classList.remove('active');
    button.classList.add('active');
    document.querySelectorAll('.publication').forEach((publication) => {
      publication.classList.toggle('hidden', button.dataset.filter !== 'all' && publication.dataset.category !== button.dataset.filter);
    });
  });
});

let language = document.documentElement.lang.startsWith('pt') ? 'pt' : 'en';
const languageButton = document.querySelector('.lang-button');

const applyLanguage = () => {
  document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en';
  document.querySelectorAll('[data-pt]').forEach((element) => {
    element.textContent = element.dataset[language];
  });
  languageButton.textContent = language === 'pt' ? 'EN' : 'PT';
  languageButton.setAttribute('aria-label', language === 'pt' ? 'Mudar idioma para inglês' : 'Switch language to Portuguese');
};

applyLanguage();

languageButton.addEventListener('click', () => {
  language = language === 'pt' ? 'en' : 'pt';
  applyLanguage();
});

document.querySelector('#year').textContent = new Date().getFullYear();

const backToTop = document.querySelector('.back-to-top');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const updateBackToTop = () => {
  backToTop.classList.toggle('visible', window.scrollY > 500);
};

window.addEventListener('scroll', updateBackToTop, { passive: true });
updateBackToTop();

backToTop.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: reducedMotion.matches ? 'auto' : 'smooth'
  });
});
