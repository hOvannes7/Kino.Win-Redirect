// Общий код для страницы, фонового скрипта и настроек.
(function (g) {
  const DEFAULT_DOMAIN = "kinokino.win";

  // "https://KinoKino.win/abc" → "kinokino.win"; для мусора вернёт null
  function normalizeDomain(input) {
    let s = String(input || "").trim().toLowerCase();
    s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//, "").replace(/[\/?#].*$/, "");
    const ok = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+(:\d{1,5})?$/.test(s);
    return ok ? s : null;
  }

  // "/film/301/cast/" → { type: "film", id: "301" }
  function parseMoviePath(pathname) {
    const m = /^\/(film|series)\/(\d+)(?:\/|$)/.exec(pathname);
    return m ? { type: m[1], id: m[2] } : null;
  }

  function parseKinopoiskUrl(url) {
    try {
      const u = new URL(url);
      if (u.protocol !== "https:" || !/^(www\.)?kinopoisk\.ru$/.test(u.hostname)) return null;
      return parseMoviePath(u.pathname);
    } catch {
      return null;
    }
  }

  function buildUrl(domain, movie) {
    return `https://${domain}/${movie.type}/${movie.id}/`;
  }

  async function getDomain() {
    try {
      const { domain } = await chrome.storage.sync.get("domain");
      return normalizeDomain(domain) || DEFAULT_DOMAIN;
    } catch {
      return DEFAULT_DOMAIN;
    }
  }

  g.KinoRedirect = { DEFAULT_DOMAIN, normalizeDomain, parseMoviePath, parseKinopoiskUrl, buildUrl, getDomain };
})(globalThis);
