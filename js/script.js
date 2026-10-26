// World Tech Consulting S.A — interactions du site

const PAGES = ['accueil', 'services', 'materiel', 'reparations', 'securite', 'aeroport', 'finance', 'apropos', 'contact'];
const NAV_DROPDOWN_PAGES = ['services', 'materiel', 'reparations', 'securite', 'aeroport', 'finance'];

// ---------- Révélation au défilement (fondu + léger déplacement à l'entrée) ----------
const REVEAL_SELECTOR = '.why-cards > *, .process-grid > *, .logo-grid > *, .catalog > *, ' +
  '.product-grid > *, .cat-grid > *, .services-grid > *, .service-block-photo, .about-history, .flow-step';

let revealObserver = null;
if ('IntersectionObserver' in window) {
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.classList.add('is-visible');
        revealObserver.unobserve(el);
        // Une fois l'entrée jouée, on retire les classes de révélation : l'élément
        // retrouve son état normal et les effets au survol (transform) reprennent la main
        // sans conflit de spécificité CSS avec les règles .reveal-item.
        const cleanup = () => {
          el.classList.remove('reveal-item', 'is-visible');
          el.style.transitionDelay = '';
        };
        el.addEventListener('transitionend', cleanup, { once: true });
        setTimeout(cleanup, 900); // filet de sécurité (ex. prefers-reduced-motion coupe les transitions)
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
}

function initRevealForPage(pageEl) {
  if (!revealObserver || !pageEl) return;
  const items = pageEl.querySelectorAll(REVEAL_SELECTOR);
  items.forEach((el, i) => {
    if (el.classList.contains('reveal-item') || el.classList.contains('is-visible')) return;
    el.classList.add('reveal-item');
    el.style.transitionDelay = (Math.min(i % 4, 3) * 0.08) + 's';
    revealObserver.observe(el);
  });
}

function showPage(name) {
  if (!PAGES.includes(name)) name = 'accueil';

  PAGES.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.style.display = (p === name) ? 'block' : 'none';
  });

  document.querySelectorAll('.nav-links a').forEach(a => {
    const isCurrent = a.getAttribute('href') === '#' + name;
    a.style.borderColor = isCurrent ? 'var(--blue-500)' : 'transparent';
  });

  // Le déclencheur du menu déroulant "Services" reste surligné pour ses 4 sous-pages
  const dropdownToggle = document.querySelector('.nav-dropdown-toggle');
  if (dropdownToggle) {
    dropdownToggle.style.borderColor = NAV_DROPDOWN_PAGES.includes(name) ? 'var(--blue-500)' : 'transparent';
  }

  window.scrollTo({ top: 0, behavior: 'auto' });
  initRevealForPage(document.getElementById('page-' + name));
}

document.addEventListener('DOMContentLoaded', () => {

  // Navigation entre pages : intercepte tous les liens internes vers une page connue
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = link.getAttribute('href').slice(1);
    if (PAGES.includes(target)) {
      e.preventDefault();
      showPage(target);
      history.pushState(null, '', '#' + target);
    }
  });

  window.addEventListener('popstate', () => {
    showPage(location.hash.replace('#', '') || 'accueil');
  });

  // Affiche la bonne page au chargement (respecte un lien direct avec #ancre)
  showPage(location.hash.replace('#', '') || 'accueil');

  // Formulaire de contact — envoi via EmailJS (les emails arrivent dans info@worldtech.ht,
  // sans aucune mention d'un service tiers). Identifiants à remplir : voir docs/GUIDE-EMAILJS.md
  const EMAILJS_CONFIG = {
    publicKey:   '2zX4ADCAATCHc_TnA',
    serviceId:   'service_gbob24k',
    templateId:  'template_vxuymag',   // message reçu par World Tech
    autoReplyId: ''                               // optionnel : réponse automatique au client ('' = désactivée)
  };

  const contactForm = document.getElementById('contactForm');
  const contactSubmitBtn = contactForm ? contactForm.querySelector('button[type="submit"]') : null;
  const contactFormNote = document.getElementById('contactFormNote');
  const SUBMIT_LABEL = contactSubmitBtn ? contactSubmitBtn.textContent : '';
  const PAGE_LOADED_AT = Date.now();
  let lastSendAt = 0;
  let sendCount = 0;

  function showFormNote(message, ok) {
    if (!contactFormNote) return;
    contactFormNote.textContent = message;
    contactFormNote.style.color = ok ? '#2E7D5B' : '#B3382C';
    contactFormNote.style.display = 'block';
  }

  function emailjsSend(templateId, params) {
    return fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_CONFIG.serviceId,
        template_id: templateId,
        user_id: EMAILJS_CONFIG.publicKey,
        template_params: params
      })
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) { throw new Error('EmailJS ' + res.status + ' ' + t); });
      }
    });
  }

  if (contactForm && contactSubmitBtn) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Anti-spam : le champ caché doit rester vide
      const honeypot = document.getElementById('websiteField');
      if (honeypot && honeypot.value) return;

      if (!contactForm.checkValidity()) {
        contactForm.classList.add('was-validated'); // Bootstrap : met en évidence les champs invalides
        contactForm.reportValidity();
        return;
      }

      // Anti-spam : formulaire rempli trop vite (robot) ou envois trop rapprochés
      const maintenant = Date.now();
      if (maintenant - PAGE_LOADED_AT < 3000) {
        showFormNote('Merci de patienter quelques secondes avant d\u2019envoyer.', false);
        return;
      }
      if (maintenant - lastSendAt < 60000 || sendCount >= 5) {
        showFormNote('Votre message a déjà été envoyé. Pour une autre demande, patientez une minute ou appelez-nous au +509 5622-2772.', false);
        return;
      }

      const f = contactForm.elements;
      const heure = new Date().getHours();
      // Une seule ligne, sans caractères de contrôle (évite l'injection d'en-têtes dans les emails)
      const uneLigne = function (v, max) { return String(v).replace(/[\u0000-\u001F\u007F<>]+/g, ' ').trim().slice(0, max); };
      const nom = uneLigne(f.nom.value, 80);
      const courriel = uneLigne(f.email.value, 120);
      const entreprise = uneLigne(f.entreprise.value, 100) || '—';
      const sujet = uneLigne(f.sujet.value, 120) || 'Demande de contact';
      const texte = f.message.value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, 2000);
      const params = {
        // Variables du modèle EmailJS standard « Contact Us »
        name:    nom,
        email:   courriel,
        title:   sujet,
        time:    new Date().toLocaleString('fr-FR', { timeZone: 'America/Port-au-Prince' }),
        message: 'Email : ' + courriel + '\nEntreprise : ' + entreprise + '\n\n' + texte,
        // Variables des modèles personnalisés (docs/emailjs-templates)
        from_name:  nom,
        from_email: courriel,
        company:    entreprise,
        subject:    sujet,
        salutation: (heure >= 18 || heure < 5) ? 'Bonsoir' : 'Bonjour'
      };

      contactSubmitBtn.disabled = true;
      contactSubmitBtn.textContent = 'Envoi en cours...';

      emailjsSend(EMAILJS_CONFIG.templateId, params)
        .then(function () {
          // La réponse automatique ne doit jamais faire échouer l'envoi principal
          if (EMAILJS_CONFIG.autoReplyId) {
            emailjsSend(EMAILJS_CONFIG.autoReplyId, params).catch(function (err) { console.warn(err); });
          }
          lastSendAt = Date.now(); sendCount += 1;
          contactForm.reset(); contactForm.classList.remove('was-validated');
          showFormNote('Message envoyé — merci, nous vous répondons bientôt.', true);
        })
        .catch(function (err) {
          console.error(err);
          showFormNote("L'envoi a échoué. Écrivez-nous à info@worldtech.ht ou appelez le +509 5622-2772.", false);
        })
        .then(function () {
          contactSubmitBtn.disabled = false;
          contactSubmitBtn.textContent = SUBMIT_LABEL;
        });
    });
  }

  // Menu mobile (burger)
  const burger = document.getElementById('burgerBtn');
  const navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Menu déroulant "Services" : se referme après un clic sur un lien
  document.querySelectorAll('.nav-item-dropdown').forEach(dd => {
    dd.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        dd.classList.add('dd-closed');
        if (document.activeElement && dd.contains(document.activeElement)) document.activeElement.blur();
      });
    });
    // Le menu redevient utilisable dès que la souris quitte la zone
    dd.addEventListener('mouseleave', () => dd.classList.remove('dd-closed'));
    // Clavier : Échap referme le menu
    dd.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        dd.classList.add('dd-closed');
        if (document.activeElement) document.activeElement.blur();
      }
    });
    // Au clavier, Tab vers le menu le rouvre
    dd.addEventListener('focusin', () => { if (dd.matches(':focus-visible, :has(:focus-visible)')) dd.classList.remove('dd-closed'); });
  });

  // Met à jour l'année du copyright automatiquement
  const yearEl = document.querySelector('.footer-bottom span');
  if (yearEl) {
    yearEl.textContent = yearEl.textContent.replace(/\d{4}/, new Date().getFullYear());
  }

  // Ombre de l'en-tête + bouton "retour en haut" au défilement
  const headerEl = document.querySelector('header');
  const backToTopBtn = document.getElementById('backToTop');
  let scrollTicking = false;

  function onScrollUpdate() {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (headerEl) headerEl.classList.toggle('header-scrolled', y > 8);
    if (backToTopBtn) backToTopBtn.classList.toggle('visible', y > 480);
    scrollTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(onScrollUpdate);
      scrollTicking = true;
    }
  }, { passive: true });

  onScrollUpdate();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});

// Carte : si l'appareil est hors ligne, on affiche l'adresse à la place de la carte Google
(function () {
  var box = document.getElementById('mapEmbed');
  if (!box) return;
  function refresh() { box.classList.toggle('is-offline', !navigator.onLine); }
  window.addEventListener('online', refresh);
  window.addEventListener('offline', refresh);
  refresh();
})();

// Photos : agrandissement dans une fenêtre Bootstrap (modal)
(function () {
  var modalEl = document.getElementById('photoModal');
  if (!modalEl) return;
  modalEl.addEventListener('show.bs.modal', function (ev) {
    var t = ev.relatedTarget;
    if (!t) return;
    var img = document.getElementById('photoModalImg');
    img.src = t.getAttribute('data-src') || '';
    img.alt = t.getAttribute('data-caption') || '';
    document.getElementById('photoModalLabel').textContent = t.getAttribute('data-caption') || 'Photo';
  });
  modalEl.addEventListener('hidden.bs.modal', function () {
    document.getElementById('photoModalImg').src = '';
  });
})();
