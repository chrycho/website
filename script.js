const languageStorageKey = 'chrystian-website-language';
const initialPublicationCount = 6;
const publications = Array.isArray(window.publications) ? window.publications : [];
const publicationList = document.querySelector('#publication-list');
const publicationToggle = document.querySelector('.publication-toggle');
const publicationResults = document.querySelector('#publication-results');
const filterButtons = document.querySelectorAll('.filter');
const languageButton = document.querySelector('.lang-button');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('#main-nav');
const compactHeader = window.matchMedia('(max-width: 1100px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let selectedCategory = 'all';
let showAllPublications = false;
let menuOpen = false;

const messages = {
  en: {
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    switchLanguage: 'Switch language to Portuguese',
    showAll: 'Show all',
    showFewer: 'Show fewer',
    readPaper: 'Read paper',
    results: (shown, total) => `Showing ${shown} of ${total} ${total === 1 ? 'publication' : 'publications'}`,
    noResults: 'No publications match this category.',
    pageTitle: 'Chrystian Pereira | Astronomy',
    description: 'Chrystian Luciano Pereira — stellar occultations, small bodies and ring systems.'
  },
  pt: {
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    switchLanguage: 'Mudar idioma para inglês',
    showAll: 'Mostrar todas',
    showFewer: 'Mostrar menos',
    readPaper: 'Ler artigo',
    results: (shown, total) => `Exibindo ${shown} de ${total} ${total === 1 ? 'publicação' : 'publicações'}`,
    noResults: 'Nenhuma publicação nesta categoria.',
    pageTitle: 'Chrystian Pereira | Astronomia',
    description: 'Chrystian Luciano Pereira — ocultações estelares, pequenos corpos e sistemas de anéis.'
  }
};

function readSavedLanguage() {
  try {
    return localStorage.getItem(languageStorageKey) === 'pt' ? 'pt' : 'en';
  } catch {
    // Storage can be unavailable in private browsing or restricted environments.
    return 'en';
  }
}

let language = readSavedLanguage();

function applyLanguage() {
  document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en';
  document.title = messages[language].pageTitle;
  document.querySelector('meta[name="description"]').content = messages[language].description;
  document.querySelectorAll('[data-en][data-pt]').forEach((element) => {
    element.textContent = element.dataset[language];
  });
  ['alt', 'aria-label', 'title'].forEach((attribute) => {
    document.querySelectorAll(`[data-en-${attribute}]`).forEach((element) => {
      element.setAttribute(attribute, element.getAttribute(`data-${language}-${attribute}`));
    });
  });
  languageButton.textContent = language === 'pt' ? 'EN' : 'PT';
  languageButton.lang = language === 'pt' ? 'en' : 'pt-BR';
  languageButton.setAttribute('aria-label', messages[language].switchLanguage);
  languageButton.title = messages[language].switchLanguage;
  updateMenu();
  updatePublications();
}

function updateMenu() {
  const expanded = compactHeader.matches && menuOpen;
  menuButton.hidden = !compactHeader.matches;
  menuButton.setAttribute('aria-expanded', String(expanded));
  menuButton.setAttribute('aria-label', messages[language][expanded ? 'closeMenu' : 'openMenu']);
  nav.hidden = compactHeader.matches && !expanded;
}

function closeMenu(returnFocus = false) {
  menuOpen = false;
  if (returnFocus) menuButton.focus();
  updateMenu();
}

menuButton.addEventListener('click', () => {
  menuOpen = !menuOpen;
  updateMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuOpen) closeMenu(true);
});

document.addEventListener('click', (event) => {
  if (menuOpen && !event.target.closest('.site-header')) closeMenu();
});

document.addEventListener('focusin', (event) => {
  if (menuOpen && !event.target.closest('.site-header')) closeMenu();
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    // Return focus before hiding the navigation; native anchor navigation then focuses its destination.
    closeMenu(compactHeader.matches);
  });
});

compactHeader.addEventListener('change', () => {
  const focusWillBeHidden = compactHeader.matches && nav.contains(document.activeElement);
  const menuHadFocus = document.activeElement === menuButton;
  menuOpen = false;
  updateMenu();
  if (focusWillBeHidden) menuButton.focus();
  if (!compactHeader.matches && menuHadFocus) nav.querySelector('a').focus();
});

function createPaperLink(publication) {
  const link = document.createElement('a');
  link.href = publication.url;
  link.target = '_blank';
  link.rel = 'noopener';
  return link;
}

function createArrow() {
  const arrow = document.createElement('span');
  arrow.className = 'arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';
  return arrow;
}

function renderPublicationRows() {
  const fragment = document.createDocumentFragment();
  publications.forEach((publication) => {
    const row = document.createElement('div');
    row.className = 'publication';
    row.setAttribute('role', 'listitem');
    const link = createPaperLink(publication);
    const year = document.createElement('span');
    year.className = 'pub-year';
    year.textContent = publication.year;
    const details = document.createElement('div');
    details.className = 'pub-details';
    details.lang = 'en';
    const title = document.createElement('h4');
    title.textContent = publication.title;
    const citation = document.createElement('p');
    // Author strings are maintained locally and retain the existing <strong> emphasis.
    citation.innerHTML = publication.authors;
    citation.append(document.createTextNode(`, ${publication.journal}`));
    details.append(title, citation);
    link.append(year, details, createArrow());
    row.append(link);
    fragment.append(row);
  });
  publicationList.replaceChildren(fragment);
}

function renderFeaturedStudies() {
  const featuredList = document.querySelector('#featured-list');
  publications.filter((publication) => publication.featured)
    .sort((a, b) => a.featured.order - b.featured.order)
    .forEach((publication) => {
      const study = document.createElement('article');
      study.className = 'featured-study';
      const year = document.createElement('span');
      year.className = 'pub-year';
      year.textContent = publication.year;
      const title = document.createElement('h4');
      title.textContent = publication.title;
      title.lang = 'en';
      const summary = document.createElement('p');
      summary.dataset.en = publication.featured.summary.en;
      summary.dataset.pt = publication.featured.summary.pt;
      const link = createPaperLink(publication);
      link.className = 'text-link';
      const label = document.createElement('span');
      label.dataset.en = messages.en.readPaper;
      label.dataset.pt = messages.pt.readPaper;
      link.setAttribute('data-en-aria-label', `${messages.en.readPaper}: ${publication.title}`);
      link.setAttribute('data-pt-aria-label', `${messages.pt.readPaper}: ${publication.title}`);
      link.append(label, createArrow());
      study.append(year, title, summary, link);
      featuredList.append(study);
    });
  document.querySelector('.featured-studies').hidden = !featuredList.children.length;
}

function updatePublications() {
  let matchingCount = 0;
  let visibleCount = 0;
  // Filter all records before applying the display limit, including previously hidden rows.
  publications.forEach((publication, index) => {
    const matches = selectedCategory === 'all' || publication.categories.includes(selectedCategory);
    if (matches) matchingCount += 1;
    const visible = matches && (showAllPublications || visibleCount < initialPublicationCount);
    publicationList.children[index].hidden = !visible;
    if (visible) visibleCount += 1;
  });
  filterButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.filter === selectedCategory));
  });
  publicationResults.textContent = matchingCount
    ? messages[language].results(visibleCount, matchingCount)
    : messages[language].noResults;
  publicationToggle.hidden = matchingCount <= initialPublicationCount;
  publicationToggle.setAttribute('aria-expanded', String(showAllPublications));
  publicationToggle.textContent = showAllPublications
    ? messages[language].showFewer
    : `${messages[language].showAll} (${matchingCount})`;
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectedCategory = button.dataset.filter;
    showAllPublications = false;
    updatePublications();
  });
});

publicationToggle.addEventListener('click', () => {
  showAllPublications = !showAllPublications;
  updatePublications();
  // Keep the control in view when collapsing a long list, without moving keyboard focus.
  if (!showAllPublications) publicationToggle.scrollIntoView({ block: 'nearest', behavior: 'instant' });
});

languageButton.addEventListener('click', () => {
  language = language === 'en' ? 'pt' : 'en';
  applyLanguage();
  try {
    localStorage.setItem(languageStorageKey, language);
  } catch {
    // The language switch still works when the preference cannot be saved.
  }
});

renderPublicationRows();
renderFeaturedStudies();
applyLanguage();
languageButton.hidden = false;
document.querySelector('.publication-browser').hidden = !publications.length;
document.querySelector('#year').textContent = new Date().getFullYear();

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-entering');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}
