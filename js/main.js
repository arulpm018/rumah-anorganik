// ===================================================
//   RUMAH ANORGANIK CIBANTENG — main.js
// ===================================================

document.addEventListener('DOMContentLoaded', () => {

  // --- NAVBAR SCROLL EFFECT ---
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // --- MOBILE NAV TOGGLE ---
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // --- SCROLL REVEAL ---
  const revealEls = document.querySelectorAll(
    '.section-label, .section-title, .section-desc, ' +
    '.tentang-text, .tentang-img-stack, ' +
    '.mesin-card, .gudang-section, .lokasi-foto-section, ' +
    '.dampak-card, .timeline-item, ' +
    '.sertifikat-card, ' +
    '.kemitraan-card, .kemitraan-cta, ' +
    '.kontak-item, .kontak-map, ' +
    '.hero-badge, .hero-title, .hero-sub, .hero-stats, .hero-actions, .hero-img-placeholder'
  );
  revealEls.forEach(el => el.classList.add('reveal'));
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${(i % 6) * 80}ms`;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => revealObserver.observe(el));

  // --- ACTIVE NAV LINK ON SCROLL ---
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-links a');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinkEls.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  sections.forEach(s => sectionObserver.observe(s));


  // ===================================================
  //   PRODUCT SLIDER
  // ===================================================
  const track = document.getElementById('sliderTrack');
  const btnPrev = document.getElementById('sliderPrev');
  const btnNext = document.getElementById('sliderNext');
  const dotsWrapper = document.getElementById('sliderDots');
  const currentLabel = document.getElementById('slideCurrentLabel');
  const totalLabel = document.getElementById('slideTotalLabel');

  if (track) {
    const origCards = Array.from(track.querySelectorAll('.slide-card'));
    const total = origCards.length;
    const GAP = 24; // matches CSS gap: 1.5rem

    if (totalLabel) totalLabel.textContent = total;

    // --- Infinite loop: clone all cards before & after originals ---
    // Structure: [clones-end] [originals] [clones-start]
    const clonesBefore = origCards.map(c => {
      const cl = c.cloneNode(true);
      cl.setAttribute('aria-hidden', 'true');
      return cl;
    });
    const clonesAfter = origCards.map(c => {
      const cl = c.cloneNode(true);
      cl.setAttribute('aria-hidden', 'true');
      return cl;
    });

    // Prepend clones of the END cards (so prev-wrap feels seamless)
    clonesBefore.reverse().forEach(cl => track.prepend(cl));
    // Append clones of the START cards
    clonesAfter.forEach(cl => track.appendChild(cl));

    // All cards now in track (clones + originals + clones)
    const allCards = Array.from(track.querySelectorAll('.slide-card'));
    // Real cards start at index `total` (after the prepended clones)
    let current = total; // points into allCards; real index = current - total

    // Build dots (one per real card)
    origCards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Produk ${i + 1}`);
      dot.addEventListener('click', () => goTo(i + total));
      dotsWrapper.appendChild(dot);
    });
    const dots = Array.from(dotsWrapper.querySelectorAll('.slider-dot'));

    function getCardWidth() {
      return allCards[0].getBoundingClientRect().width + GAP;
    }

    // Jump without animation (used after clone-boundary teleport)
    function jumpTo(index) {
      track.style.transition = 'none';
      current = index;
      track.style.transform = `translateX(-${current * getCardWidth()}px)`;
    }

    function goTo(index) {
      current = index;
      track.style.transition = 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)';
      track.style.transform = `translateX(-${current * getCardWidth()}px)`;

      // Real index for dots/counter (wraps into 0..total-1)
      const realIdx = ((current - total) % total + total) % total;
      dots.forEach((d, i) => d.classList.toggle('active', i === realIdx));
      if (currentLabel) currentLabel.textContent = realIdx + 1;
    }

    // After a transition, silently teleport if we're in a clone zone
    track.addEventListener('transitionend', () => {
      // Landed on after-clones → jump back to real start zone
      if (current >= total * 2) {
        jumpTo(current - total);
      }
      // Landed on before-clones → jump forward to real end zone
      if (current < total) {
        jumpTo(current + total);
      }
    });

    if (btnPrev) {
      btnPrev.disabled = false; // always enabled now
      btnPrev.addEventListener('click', () => goTo(current - 1));
    }
    if (btnNext) {
      btnNext.disabled = false;
      btnNext.addEventListener('click', () => goTo(current + 1));
    }

    // Init: position at real card 0 (no animation)
    jumpTo(total);

    // Touch / drag support
    let startX = 0, isDragging = false, moved = false;

    track.addEventListener('mousedown', e => {
      startX = e.clientX; isDragging = true; moved = false;
    });
    track.addEventListener('mousemove', e => {
      if (!isDragging) return;
      if (Math.abs(e.clientX - startX) > 5) moved = true;
    });
    track.addEventListener('mouseup', e => {
      if (!isDragging) return;
      isDragging = false;
      if (!moved) return;
      const diff = e.clientX - startX;
      if (diff < -50) goTo(current + 1);
      else if (diff > 50) goTo(current - 1);
    });
    track.addEventListener('mouseleave', () => { isDragging = false; });

    track.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX; moved = false;
    }, { passive: true });
    track.addEventListener('touchmove', e => {
      if (Math.abs(e.touches[0].clientX - startX) > 5) moved = true;
    }, { passive: true });
    track.addEventListener('touchend', e => {
      if (!moved) return;
      const diff = e.changedTouches[0].clientX - startX;
      if (diff < -50) goTo(current + 1);
      else if (diff > 50) goTo(current - 1);
    });

    // Keyboard nav
    document.addEventListener('keydown', e => {
      const rect = document.getElementById('produk').getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        if (e.key === 'ArrowRight') goTo(current + 1);
        if (e.key === 'ArrowLeft') goTo(current - 1);
      }
    });

    // Auto-advance every 5s
    let autoTimer = setInterval(() => goTo(current + 1), 5000);
    const sliderWrapper = track.closest('.slider-wrapper');
    sliderWrapper.addEventListener('mouseenter', () => clearInterval(autoTimer));
    sliderWrapper.addEventListener('mouseleave', () => {
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    });

    // Recalculate on resize
    window.addEventListener('resize', () => jumpTo(current), { passive: true });
  }


  // ===================================================
  //   SERTIFIKAT LIGHTBOX
  // ===================================================
  const lightbox = document.getElementById('lightbox');
  const lbBackdrop = document.getElementById('lightboxBackdrop');
  const lbClose = document.getElementById('lightboxClose');
  const lbImgWrap = document.getElementById('lightboxImgWrap');
  const lbPrev = document.getElementById('lightboxPrev');
  const lbNext = document.getElementById('lightboxNext');
  const lbCounter = document.getElementById('lightboxCounter');

  if (!lightbox) return;

  // Gather sertifikat card data
  const sertCards = Array.from(document.querySelectorAll('.sertifikat-card'));
  let lbCurrent = 0;

  function getCardData(card) {
    const img = card.querySelector('img');
    const ph = card.querySelector('.img-ph');
    const h4 = card.querySelector('h4');
    return {
      src: img ? img.src : null,
      title: h4 ? h4.textContent : '',
      ph: ph,
    };
  }

  function renderLightboxSlide(index) {
    lbCurrent = Math.max(0, Math.min(index, sertCards.length - 1));
    const data = getCardData(sertCards[lbCurrent]);

    lbImgWrap.innerHTML = '';

    if (data.src) {
      const img = document.createElement('img');
      img.src = data.src;
      img.alt = data.title;
      lbImgWrap.appendChild(img);
    } else if (data.ph) {
      // Clone placeholder for lightbox
      const clone = data.ph.cloneNode(true);
      clone.style.minHeight = '400px';
      lbImgWrap.appendChild(clone);
    }

    if (lbCounter) {
      lbCounter.textContent = `${lbCurrent + 1} / ${sertCards.length}`;
    }
    if (lbPrev) lbPrev.disabled = lbCurrent === 0;
    if (lbNext) lbNext.disabled = lbCurrent === sertCards.length - 1;
  }

  function openLightbox(index) {
    renderLightboxSlide(index);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Attach zoom buttons
  document.querySelectorAll('.sertifikat-zoom-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      openLightbox(idx);
    });
  });

  // Also clicking the card image opens lightbox
  sertCards.forEach((card, idx) => {
    card.querySelector('.sertifikat-img-wrap').addEventListener('click', () => openLightbox(idx));
    card.querySelector('.sertifikat-img-wrap').style.cursor = 'zoom-in';
  });

  if (lbBackdrop) lbBackdrop.addEventListener('click', closeLightbox);
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', () => renderLightboxSlide(lbCurrent - 1));
  if (lbNext) lbNext.addEventListener('click', () => renderLightboxSlide(lbCurrent + 1));

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') renderLightboxSlide(lbCurrent + 1);
    if (e.key === 'ArrowLeft') renderLightboxSlide(lbCurrent - 1);
  });

});

// --- Smooth Scroll polyfill ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});