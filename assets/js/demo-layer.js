/**
 * demo-layer.js — Twin Site Creator demo layer.
 *
 * Fully isolated from the notary site. Remove the <script> and <link>
 * for demo-layer and the page works as a normal notary site.
 *
 * What it does:
 *  - shows a demo banner above the header;
 *  - lets a visitor type a notary name and city and see them across the page
 *    (elements marked with data-tsc="…"), including the hero seal and <title>.
 *
 * Data priority: URL ?n=NAME&c=CITY → localStorage "tsc-demo" → defaults.
 * User input is only ever written with textContent / setAttribute.
 */
(function () {
  "use strict";

  /* ---------- settings ---------- */
  const TG_NICK = "YOUR_TG"; // Telegram username without @
  const STORE_KEY = "tsc-demo";
  const CLOSED_KEY = "tsc-demo-closed";
  const MAX_NAME = 40;
  const MAX_CITY = 25;
  const FADE_MS = 200;

  const isEn = (document.documentElement.lang || "").toLowerCase().startsWith("en");

  const TEXT = isEn
    ? {
        defaults: { name: "Olena Koval", city: "Kharkiv" },
        intro: "This is a demo site by Twin Site Creator.",
        open: "See how your site would look →",
        namePh: "Notary's name",
        cityPh: "City",
        show: "Show",
        result: (n, c) => [`This is how your site could look: `, n, `, `, c, `. Ready in 7 days.`],
        want: "I want this site",
        edit: "Change",
        reset: "Reset",
        close: "Close demo banner",
        form: "Personalise the demo",
        address: (c) => `Your address, ${c}`,
        district: (c) => `Notarial district: ${c}.`,
        title: (n, c) => `${n} — Private Notary, ${c}`,
        logoLabel: (n, c) => `Private notary ${n}, ${c} — home`,
        tg: (n, c) => `Hi! I'd like a site like the notary-landing demo. Notary: ${n}, city: ${c}.`,
      }
    : {
        defaults: { name: "Олена Коваль", city: "Харків" },
        intro: "Це демо-сайт від Twin Site Creator.",
        open: "Подивіться, як виглядатиме ваш сайт →",
        namePh: "Ім'я нотаріуса",
        cityPh: "Місто",
        show: "Показати",
        result: (n, c) => [`Так виглядатиме ваш сайт: `, n, `, `, c, `. Готовий за 7 днів.`],
        want: "Хочу такий сайт",
        edit: "Змінити",
        reset: "Скинути",
        close: "Закрити демо-плашку",
        form: "Персоналізувати демо",
        address: (c) => `Ваша адреса, ${c}`,
        district: (c) => `Нотаріальний округ: ${c}.`,
        title: (n, c) => `${n} — приватний нотаріус, ${c}`,
        logoLabel: (n, c) => `Приватний нотаріус ${n}, ${c} — на головну`,
        tg: (n, c) => `Вітаю! Хочу такий сайт, як демо notary-landing. Нотаріус: ${n}, місто: ${c}.`,
      };

  /* ---------- helpers ---------- */
  function clean(value, max) {
    return String(value || "")
      .replace(/[\u0000-\u001F\u007F<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, max)
      .trim();
  }

  function el(tag, attrs, text) {
    const node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach((k) => node.setAttribute(k, attrs[k]));
    if (text != null) node.textContent = text;
    return node;
  }

  function readStore() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      return raw && typeof raw === "object" ? raw : null;
    } catch (e) {
      return null;
    }
  }

  function writeStore(data) {
    try {
      if (data) localStorage.setItem(STORE_KEY, JSON.stringify(data));
      else localStorage.removeItem(STORE_KEY);
    } catch (e) {
      /* storage blocked — ignore */
    }
  }

  function setUrl(data) {
    const url = new URL(location.href);
    url.searchParams.delete("n");
    url.searchParams.delete("c");
    if (data) {
      url.searchParams.set("n", data.name);
      url.searchParams.set("c", data.city);
    }
    history.replaceState(null, "", url);
  }

  /* ---------- state ---------- */
  function loadState() {
    const params = new URLSearchParams(location.search);
    let name = clean(params.get("n"), MAX_NAME);
    let city = clean(params.get("c"), MAX_CITY);
    if (name || city) {
      writeStore({ name, city });
    } else {
      const saved = readStore();
      if (saved) {
        name = clean(saved.name, MAX_NAME);
        city = clean(saved.city, MAX_CITY);
      }
    }
    return normalize(name, city);
  }

  function normalize(name, city) {
    const d = TEXT.defaults;
    name = name || d.name;
    city = city || d.city;
    return {
      name,
      city,
      nameCustom: name !== d.name,
      cityCustom: city !== d.city,
    };
  }

  /* ---------- apply to page ---------- */
  const originals = new Map(); // element → original text / attribute values

  function remember(node, key, value) {
    if (!originals.has(node)) originals.set(node, {});
    const store = originals.get(node);
    if (!(key in store)) store[key] = value;
    return store[key];
  }

  function applyToPage(state) {
    const custom = state.nameCustom || state.cityCustom;
    document.documentElement.classList.toggle("tsc-custom", custom);

    document.querySelectorAll("[data-tsc]").forEach((node) => {
      const type = node.getAttribute("data-tsc");
      switch (type) {
        case "name":
          node.textContent = state.name;
          break;
        case "surname":
          // surname = last word of the name ("Ірина Мельник" → "Мельник")
          node.textContent = state.name.split(" ").pop();
          break;
        case "city":
          node.textContent = state.city;
          break;
        case "address": {
          const orig = remember(node, "text", node.textContent);
          node.textContent = state.cityCustom ? TEXT.address(state.city) : orig;
          break;
        }
        case "district": {
          const orig = remember(node, "text", node.textContent);
          node.textContent = state.cityCustom ? TEXT.district(state.city) : orig;
          break;
        }
        case "local":
          // Text tied to the default city (e.g. "у Харкові", metro station).
          node.hidden = state.cityCustom;
          break;
        case "title": {
          const orig = remember(node, "text", node.textContent.trim());
          node.textContent = custom ? TEXT.title(state.name, state.city) : orig;
          break;
        }
        case "maplink": {
          const orig = remember(node, "href", node.getAttribute("href"));
          node.setAttribute(
            "href",
            state.cityCustom
              ? "https://maps.google.com/?q=" + encodeURIComponent(state.city)
              : orig,
          );
          break;
        }
        case "mapframe": {
          const src = remember(node, "src", node.getAttribute("src"));
          const title = remember(node, "title", node.getAttribute("title"));
          if (state.cityCustom) {
            node.setAttribute(
              "src",
              "https://maps.google.com/maps?output=embed&z=13&q=" +
                encodeURIComponent(state.city),
            );
            node.setAttribute("title", state.name + " — " + state.city);
          } else if (node.getAttribute("src") !== src) {
            node.setAttribute("src", src);
            node.setAttribute("title", title);
          }
          break;
        }
      }
    });

    document.querySelectorAll("[data-tsc-label]").forEach((node) => {
      const orig = remember(node, "label", node.getAttribute("aria-label"));
      node.setAttribute("aria-label", custom ? TEXT.logoLabel(state.name, state.city) : orig);
    });

    if (window.notarySeal) window.notarySeal.refresh();
    if (window.fitLogos) window.fitLogos();
  }

  function applyWithFade(state) {
    const nodes = document.querySelectorAll("body [data-tsc]");
    nodes.forEach((n) => n.classList.add("tsc-fade"));
    setTimeout(() => {
      applyToPage(state);
      nodes.forEach((n) => n.classList.remove("tsc-fade"));
      if (window.notarySeal) window.notarySeal.replay();
    }, FADE_MS);
  }

  /* ---------- banner ---------- */
  let bar, body;

  function buildBar() {
    bar = el("div", { class: "tsc-bar", role: "region", "aria-label": "Demo" });
    const inner = el("div", { class: "tsc-bar__inner" });
    body = el("div", { class: "tsc-bar__body", "aria-live": "polite" });
    const close = el("button", { type: "button", class: "tsc-bar__close", "aria-label": TEXT.close }, "×");
    close.addEventListener("click", () => {
      bar.remove();
      document.documentElement.classList.add("tsc-bar-off");
      try {
        sessionStorage.setItem(CLOSED_KEY, "1");
      } catch (e) {}
    });
    inner.append(body, close);
    bar.append(inner);
    document.body.prepend(bar);

    // Keep the reserved space equal to the real bar height.
    const sync = () =>
      document.documentElement.style.setProperty("--tsc-bar-h", bar.offsetHeight + "px");
    if ("ResizeObserver" in window) new ResizeObserver(sync).observe(bar);
    else sync();
  }

  function swapBody(build) {
    body.classList.add("tsc-fade");
    setTimeout(() => {
      body.replaceChildren(...build());
      body.classList.remove("tsc-fade");
    }, body.childNodes.length ? FADE_MS : 0);
  }

  function viewIntro() {
    const text = el("span", { class: "tsc-bar__text" }, TEXT.intro + " ");
    const open = el("button", { type: "button", class: "tsc-bar__link" }, TEXT.open);
    open.addEventListener("click", () => swapBody(viewForm));
    return [text, open];
  }

  function viewForm() {
    const form = el("form", { class: "tsc-form", "aria-label": TEXT.form });
    const name = el("input", {
      class: "tsc-input",
      type: "text",
      name: "n",
      maxlength: String(MAX_NAME),
      placeholder: TEXT.namePh,
      "aria-label": TEXT.namePh,
      autocomplete: "off",
    });
    const city = el("input", {
      class: "tsc-input tsc-input--city",
      type: "text",
      name: "c",
      maxlength: String(MAX_CITY),
      placeholder: TEXT.cityPh,
      "aria-label": TEXT.cityPh,
      autocomplete: "off",
    });
    if (current.nameCustom) name.value = current.name;
    if (current.cityCustom) city.value = current.city;
    const submit = el("button", { type: "submit", class: "tsc-btn" }, TEXT.show);
    form.append(name, city, submit);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const n = clean(name.value, MAX_NAME);
      const c = clean(city.value, MAX_CITY);
      if (!n && !c) {
        name.focus();
        return;
      }
      current = normalize(n, c);
      const data = { name: current.name, city: current.city };
      writeStore(data);
      setUrl(data);
      applyWithFade(current);
      swapBody(viewResult);
    });
    setTimeout(() => name.focus(), FADE_MS + 20);
    return [form];
  }

  function viewResult() {
    const parts = TEXT.result(current.name, current.city);
    const text = el("span", { class: "tsc-bar__text" });
    parts.forEach((p, i) => {
      // odd parts are the user's name and city
      text.append(i % 2 ? el("strong", null, p) : document.createTextNode(p));
    });
    const tg =
      "https://t.me/" + TG_NICK + "?text=" + encodeURIComponent(TEXT.tg(current.name, current.city));
    const want = el("a", { class: "tsc-btn", href: tg, target: "_blank", rel: "noopener" }, TEXT.want);
    const edit = el("button", { type: "button", class: "tsc-bar__link" }, TEXT.edit);
    edit.addEventListener("click", () => swapBody(viewForm));
    const reset = el("button", { type: "button", class: "tsc-bar__link tsc-bar__link--muted" }, TEXT.reset);
    reset.addEventListener("click", () => {
      writeStore(null);
      setUrl(null);
      current = normalize("", "");
      applyWithFade(current);
      swapBody(viewIntro);
    });
    const actions = el("span", { class: "tsc-bar__actions" });
    actions.append(want, edit, reset);
    return [text, actions];
  }

  /* ---------- start ---------- */
  let current = loadState();
  const custom = current.nameCustom || current.cityCustom;

  if (custom) applyToPage(current);

  let closed = false;
  try {
    closed = sessionStorage.getItem(CLOSED_KEY) === "1";
  } catch (e) {}

  // A personalised link always shows the banner, so the CTA is visible.
  if (!closed || custom) {
    buildBar();
    swapBody(custom ? viewResult : viewIntro);
  } else {
    document.documentElement.classList.add("tsc-bar-off");
  }
})();
