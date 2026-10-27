/**
 * script.js — Notary Landing Page
 * Extracted from index.html inline <script>.
 * All DOM-dependent code runs inside DOMContentLoaded.
 */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  /* ============================================================
     1. STICKY HEADER SHADOW
  ============================================================ */
  const hdr = document.querySelector(".site-header");

  if (hdr) {
    window.addEventListener(
      "scroll",
      () => {
        hdr.style.boxShadow =
          window.scrollY > 8 ? "0 1px 20px rgba(26,26,24,.08)" : "none";
      },
      { passive: true },
    );
  }

  /* ============================================================
     2. LANGUAGE TOGGLE BUTTONS
     Replaces: onclick="location.href = 'index.html'"
               onclick="location.href = 'index-en.html'"
  ============================================================ */
  const langMap = {
    uk: "index.html",
    en: "index-en.html",
  };

  document.querySelectorAll(".lang-btn[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = langMap[btn.dataset.lang];
      if (target) location.href = target;
    });
  });

  /* ============================================================
     3. MOBILE HAMBURGER MENU
  ============================================================ */
  const ham = document.getElementById("hamburger");
  const panel = document.getElementById("mobPanel");
  const overlay = document.getElementById("mobOverlay");
  const close = document.getElementById("mobClose");

  function openMenu() {
    ham.classList.add("open");
    ham.setAttribute("aria-expanded", "true");
    panel.classList.add("open");
    overlay.style.display = "block";
    requestAnimationFrame(() => overlay.classList.add("show"));
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    ham.classList.remove("open");
    ham.setAttribute("aria-expanded", "false");
    panel.classList.remove("open");
    overlay.classList.remove("show");
    document.body.style.overflow = "";
    setTimeout(() => {
      overlay.style.display = "none";
    }, 350);
  }

  ham && ham.addEventListener("click", openMenu);
  close && close.addEventListener("click", closeMenu);
  overlay && overlay.addEventListener("click", closeMenu);

  document
    .querySelectorAll(".mob-link")
    .forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* ============================================================
     4. SCROLL REVEAL
  ============================================================ */
  const srEls = document.querySelectorAll("[data-sr]");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = +(entry.target.dataset.delay || 0);
            setTimeout(() => entry.target.classList.add("in"), delay);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    srEls.forEach((el) => io.observe(el));
  } else {
    // Fallback for browsers without IntersectionObserver
    srEls.forEach((el) => el.classList.add("in"));
  }

  /* ============================================================
     5. CONTACT FORM — removed (form deleted from HTML)
     Keeping showFormMessage stub in case it is referenced elsewhere.
  ============================================================ */

  /* ============================================================
     6. HERO SEAL
  ============================================================ */
  initSeal();

  /* ============================================================
     7. LOGO FIT — long surnames / cities shrink instead of
        breaking the header
  ============================================================ */
  fitLogos();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitLogos);
  let fitFrame = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(fitLogos);
  });
  window.fitLogos = fitLogos;
}); // end DOMContentLoaded

/**
 * Shrinks .logo-name / .logo-title font size until the text fits
 * its max-width (set via --logo-max in CSS). Normal names are untouched.
 */
function fitLogos() {
  const parts = [
    { sel: ".logo-name", min: 12, step: 1 },
    { sel: ".logo-title", min: 6.5, step: 0.5 },
  ];
  parts.forEach(({ sel, min, step }) => {
    document.querySelectorAll(".logo " + sel).forEach((el) => {
      el.style.fontSize = "";
      const max = parseFloat(getComputedStyle(el).maxWidth);
      if (!max) return;
      let size = parseFloat(getComputedStyle(el).fontSize);
      while (el.scrollWidth > max + 0.5 && size > min) {
        size = Math.max(min, size - step);
        el.style.fontSize = size + "px";
      }
    });
  });
}

/**
 * Hero seal (signature + stamp). The animation itself is pure CSS
 * and plays once on load. This exposes window.notarySeal so other
 * scripts can change the text and play it again:
 *   notarySeal.refresh() — rebuild initials and fit ring text
 *   notarySeal.replay()  — play the animation again
 */
function initSeal() {
  const seal = document.querySelector(".seal-stamp");
  if (!seal) return;

  const ring = seal.querySelector(".seal__ring-text");
  const nameEl = seal.querySelector('[data-seal="name"]');
  const monoEl = seal.querySelector('[data-seal="initials"]');
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Shrink the ring text when the name or city is long.
  function fitRing() {
    if (!ring) return;
    const len = ring.textContent.replace(/\s+/g, " ").trim().length;
    const size = Math.max(8, Math.min(13, (13 * 46) / len));
    ring.style.fontSize = size.toFixed(2) + "px";
  }

  // Monogram from the first letters of the first two words of the name.
  function updateInitials() {
    if (!nameEl || !monoEl) return;
    const words = nameEl.textContent.trim().split(/\s+/).filter(Boolean);
    const initials = words
      .slice(0, 2)
      .map((w) => Array.from(w)[0])
      .join("")
      .toUpperCase();
    monoEl.textContent = initials || "✦";
  }

  function replay() {
    if (reduceMotion.matches) return;
    seal.classList.remove("seal-stamp--play");
    void seal.getBoundingClientRect(); // restart CSS animations
    seal.classList.add("seal-stamp--play");
  }

  function refresh() {
    fitRing();
    updateInitials();
  }

  refresh();
  window.notarySeal = { refresh, replay };
}
