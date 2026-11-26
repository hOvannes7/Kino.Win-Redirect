(function () {
  const KR = window.KinoRedirect; // из shared.js
  const BTN_ID = "kinokino-watch-button";
  const FLOAT_ID = "kinokino-floating-button";
  const WATCH_LABEL = "Смотреть";
  const FALLBACK_DELAY = 3000; // сколько ждём родные кнопки Кинопоиска, прежде чем показать плавающую кнопку

  const state = {
    domain: KR.DEFAULT_DOMAIN,
    ready: false,
    path: location.pathname,
    routeStart: Date.now(),
    nextScan: 0,
    timer: null
  };

  function isMoviePage() {
    return Boolean(KR.parseMoviePath(location.pathname));
  }

  // Ссылка всегда ведёт на /film/ID/ или /series/ID/ — даже со страниц /cast/, /reviews/ и т.п.
  function buildTargetUrl() {
    const movie = KR.parseMoviePath(location.pathname);
    return movie ? KR.buildUrl(state.domain, movie) : null;
  }

  function openUrl(url, newTab) {
    if (newTab) window.open(url, "_blank", "noopener");
    else window.location.assign(url);
  }

  function applyUrl(el, url) {
    el.dataset.kinokinoUrl = url;
    if (el.tagName === "A") el.href = url;
  }

  function cleanHandlers(el) {
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.toLowerCase().startsWith("on")) el.removeAttribute(attr.name);
    });
  }

  function createButton(referenceEl, url) {
    const clone = referenceEl.cloneNode(true);
    clone.id = BTN_ID;
    clone.dataset.kinokino = "true";
    applyUrl(clone, url);

    if (clone.tagName === "A") {
      clone.target = "_self";
      clone.rel = "noopener noreferrer";
    } else {
      clone.removeAttribute("disabled");
      clone.type = "button";
      clone.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopPropagation();
          // Ctrl / Cmd / Shift + клик — в новой вкладке
          openUrl(clone.dataset.kinokinoUrl, event.ctrlKey || event.metaKey || event.shiftKey);
        },
        true
      );
      // клик средней кнопкой мыши — тоже в новой вкладке
      clone.addEventListener(
        "auxclick",
        (event) => {
          if (event.button !== 1) return;
          event.preventDefault();
          event.stopPropagation();
          openUrl(clone.dataset.kinokinoUrl, true);
        },
        true
      );
    }

    cleanHandlers(clone);
    clone.textContent = WATCH_LABEL;
    clone.setAttribute("aria-label", WATCH_LABEL);
    clone.setAttribute("title", WATCH_LABEL);
    return clone;
  }

  // ── Поиск родной кнопки, рядом с которой вставляем свою ──

  const ANCHOR_MATCHERS = [
    (t) => t.includes("буду смотреть"),
    (t) => t === "смотреть фильм",
    (t) => t.includes("смотреть сериал"),
    (t) => t === "смотреть",
    (t) => t.includes("купить и смотреть")
  ];

  function textOf(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function findAnchor() {
    const items = Array.from(document.querySelectorAll("button, a"))
      .filter((el) => el.id !== BTN_ID && el.id !== FLOAT_ID)
      .map((el) => ({ el, text: textOf(el) }));
    for (const match of ANCHOR_MATCHERS) {
      const hit = items.find((item) => match(item.text));
      if (hit) return hit.el;
    }
    return null;
  }

  function findMoreButtonNear(willWatch) {
    const row = findActionRow(willWatch);
    if (!row) return null;
    const others = Array.from(row.querySelectorAll("button, a")).filter(
      (el) => el !== willWatch && el.id !== BTN_ID
    );
    return others.find((el) => {
      const txt = (el.textContent || "").trim();
      return txt === "..." || txt === "…";
    }) || null;
  }

  function findActionRow(willWatch) {
    let node = willWatch;
    while (node && node !== document.body) {
      const parent = node.parentElement;
      if (!parent) break;
      const style = window.getComputedStyle(parent);
      const isRowFlex = style.display.includes("flex") && style.flexDirection !== "column";
      if (isRowFlex && parent.querySelectorAll("button, a").length >= 2) return parent;
      node = parent;
    }
    return willWatch.parentElement;
  }

  function rowChildContaining(row, el) {
    if (!row || !el) return null;
    for (const child of Array.from(row.children)) {
      if (child.contains(el)) return child;
    }
    return null;
  }

  function wrapLike(rowChild, btn) {
    if (!rowChild || !btn) return btn;
    if (rowChild.tagName === "A" || rowChild.tagName === "BUTTON") return btn;
    const wrap = rowChild.cloneNode(false);
    wrap.removeAttribute("id");
    wrap.removeAttribute("data-testid");
    wrap.dataset.kinokinoWrap = "true"; // чтобы убрать обёртку вместе с кнопкой
    wrap.innerHTML = "";
    wrap.appendChild(btn);
    return wrap;
  }

  function mountInline(willWatch, url) {
    if (!willWatch.parentElement) return false;
    const row = findActionRow(willWatch);
    const moreButton = findMoreButtonNear(willWatch);
    const btn = createButton(moreButton || willWatch, url);

    if (row) {
      const moreChild = rowChildContaining(row, moreButton);
      const watchChild = rowChildContaining(row, willWatch);
      const targetChild = moreChild || watchChild;
      const nodeToInsert = wrapLike(targetChild, btn);

      if (targetChild && targetChild.parentElement === row) {
        targetChild.insertAdjacentElement("beforebegin", nodeToInsert);
      } else if (watchChild && watchChild.parentElement === row) {
        watchChild.insertAdjacentElement("afterend", nodeToInsert);
      } else {
        row.appendChild(nodeToInsert);
      }
    } else {
      willWatch.insertAdjacentElement("afterend", btn);
    }
    return true;
  }

  // ── Запасная плавающая кнопка: если родных кнопок на странице нет ──

  function showFloating(url) {
    let a = document.getElementById(FLOAT_ID);
    if (!a) {
      a = document.createElement("a");
      a.id = FLOAT_ID;
      a.textContent = "▶ " + WATCH_LABEL;
      a.target = "_self";
      a.rel = "noopener noreferrer";
      a.style.cssText =
        "position:fixed;right:24px;bottom:24px;z-index:2147483647;padding:12px 20px;" +
        "border-radius:999px;background:#f60;color:#fff;font:600 15px/1 system-ui,sans-serif;" +
        "text-decoration:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.35)";
      document.body.appendChild(a);
    }
    applyUrl(a, url);
  }

  function removeFloating() {
    const a = document.getElementById(FLOAT_ID);
    if (a) a.remove();
  }

  function removeInline() {
    const btn = document.getElementById(BTN_ID);
    if (btn) (btn.closest("[data-kinokino-wrap]") || btn).remove();
  }

  // ── Основной цикл ──

  function run() {
    if (!state.ready) return;

    // Перешли на другую страницу без перезагрузки — начинаем с чистого листа
    if (location.pathname !== state.path) {
      state.path = location.pathname;
      state.routeStart = Date.now();
      state.nextScan = 0;
      removeInline();
      removeFloating();
    }

    if (!isMoviePage()) {
      removeInline();
      removeFloating();
      return;
    }

    const url = buildTargetUrl();
    const existing = document.getElementById(BTN_ID);
    if (existing && existing.isConnected) {
      applyUrl(existing, url);
      removeFloating();
      return;
    }

    const floating = document.getElementById(FLOAT_ID);
    if (floating && Date.now() < state.nextScan) {
      applyUrl(floating, url);
      return;
    }

    const anchor = findAnchor();
    if (anchor && mountInline(anchor, url)) {
      removeFloating();
      return;
    }

    if (Date.now() - state.routeStart > FALLBACK_DELAY) {
      showFloating(url);
      state.nextScan = Date.now() + 2000; // пока плавающая кнопка висит, ищем родные реже
    }
  }

  function schedule() {
    if (state.timer) return;
    state.timer = setTimeout(() => {
      state.timer = null;
      run();
    }, 150);
  }

  KR.getDomain().then((domain) => {
    state.domain = domain;
    state.ready = true;
    schedule();
  });

  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "sync" || !changes.domain) return;
      state.domain = KR.normalizeDomain(changes.domain.newValue) || KR.DEFAULT_DOMAIN;
      schedule();
    });
  } catch (_) {
    /* расширение было обновлено — страница перезагрузится сама */
  }

  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("popstate", schedule);
  if (window.navigation) window.navigation.addEventListener("currententrychange", schedule);
  setInterval(schedule, 1000); // чтобы сработала плавающая кнопка, даже если страница больше не меняется
})();
