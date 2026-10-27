# Промпт для Claude у VS Code — логотип (редакційний wordmark)

Перед запуском скопіюйте файли з цього архіву в `assets/images/logo/`
(крім favicon-файлів: `favicon.svg`, `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` покладіть у `assets/images/` і замініть ними старі).

---

```
Прочитай CLAUDE.md і DATA.md. Задача — впровадити новий логотип (редакційний wordmark). Git-команди не виконуй.

ЛОГОТИП
Структура (зверху вниз, по центру):
  1) Прізвище нотаріуса — Playfair Display 900, letter-spacing −0.03em, колір var(--ink)
  2) тонка лінія 1px, ширина ~62% від ширини прізвища, колір var(--ink)
  3) «НОТАРІУС · {МІСТО}» — Manrope 600, uppercase, letter-spacing 0.38em, колір var(--stone)
Еталон вигляду — assets/images/logo/logo-wordmark.svg (НЕ вставляй його як <img> у шапку — див. нижче).

КРОК 1 — Шрифт (важливо)
Figtree НЕ має кирилиці: увесь український текст зараз рендериться системним шрифтом. Заміни Figtree на Manrope:
- у <link> Google Fonts в index.html та index-en.html: family=Manrope:wght@300;400;500;600;700 (Playfair Display лишається, додай вагу 900 якщо її немає)
- у style.css: --font-b: "Manrope", system-ui, sans-serif
- перевір, що font-weight у CSS не посилається на ваги, яких немає.

КРОК 2 — Логотип у шапці як HTML+CSS (не картинка)
Логотип має бути текстом, бо ім'я й місто підставляються через data-tsc (персоналізація демо). Розмітка:
  <a href="index.html" class="logo" aria-label="Приватний нотаріус Олена Коваль, Харків — на головну">
    <span class="logo-name" data-tsc="surname">Коваль</span>
    <span class="logo-rule" aria-hidden="true"></span>
    <span class="logo-title">Нотаріус · <span data-tsc="city">Харків</span></span>
  </a>
CSS (.logo — inline-flex, column, align-items:center, gap 4px):
  .logo-name  — font-family var(--font-d); 900; font-size 24px (десктоп) / 20px (≤768px); line-height 1; letter-spacing −0.03em
  .logo-rule  — display block; height 1px; width 62%; background var(--ink)
  .logo-title — 8.5px; 600; letter-spacing 0.38em; uppercase; color var(--stone); margin-right −0.38em (компенсує трекінг останньої літери, щоб центрування було точним)
Застосуй у: шапці, мобільному меню (.mob-head), футері (там — білий варіант: ім'я і лінія #fff, підпис rgba(255,255,255,.55)).
Прибери старий текст «Нотаріус / Приватний нотаріус · Львів» та зайвий символ «>» у .mob-head.
Шапка не повинна стати вищою, ніж зараз (максимум +6px). Перевір fixed-шапку при скролі.

КРОК 3 — Фавікони
У <head> обох сторінок заміни блок favicon на:
  <link rel="icon" href="assets/images/favicon.ico" sizes="48x48">
  <link rel="icon" href="assets/images/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="assets/images/apple-touch-icon.png">
І створи site.webmanifest (name, short_name «Нотаріус», icons 192/512, theme_color #1a1a18, background_color #f8f7f4) + <link rel="manifest">.

КРОК 4 — Персоналізація (якщо demo-layer.js вже існує)
Додай підтримку data-tsc="surname": прізвище = останнє слово з імені (?n=Ірина Мельник → «Мельник»). Перша літера прізвища — для майбутнього динамічного фавікону не потрібна, фавікон статичний.

ПЕРЕВІРКА
- 375 / 768 / 1440px: лого по центру своїх рядків, не переноситься, не налазить на бургер.
- Довге прізвище (?n=Олександра%20Шевчук-Ковальська) — лого не ламає шапку (за потреби font-size зменшується через clamp).
- Кирилиця в тілі сторінки тепер Manrope (DevTools → Computed → Rendered Fonts).
- Фавікон видно у вкладці браузера.
- Наприкінці — список змінених файлів.
```
