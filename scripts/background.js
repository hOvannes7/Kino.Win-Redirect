importScripts("shared.js");

const MENU_ID = "kinokino-open-link";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Открыть на Kinokino",
      contexts: ["link"],
      targetUrlPatterns: ["https://www.kinopoisk.ru/film/*", "https://www.kinopoisk.ru/series/*"]
    });
  });
});

// ПКМ по ссылке на фильм (поиск, списки, подборки) → открыть на Kinokino в новой вкладке
async function openFromLink(linkUrl, tab) {
  const movie = KinoRedirect.parseKinopoiskUrl(linkUrl);
  if (!movie) return;
  const url = KinoRedirect.buildUrl(await KinoRedirect.getDomain(), movie);
  chrome.tabs.create({ url, index: tab ? tab.index + 1 : undefined });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === MENU_ID) openFromLink(info.linkUrl, tab);
});

// Клик по иконке расширения → открыть текущий фильм на Kinokino
async function handleActionClick(tab) {
  const movie = KinoRedirect.parseKinopoiskUrl(tab.url);
  if (!movie) return flashBadge(tab.id);
  const url = KinoRedirect.buildUrl(await KinoRedirect.getDomain(), movie);
  chrome.tabs.update(tab.id, { url });
}

chrome.action.onClicked.addListener(handleActionClick);

// Не страница фильма — коротко показываем красный крестик на иконке
function flashBadge(tabId) {
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#d33" });
  chrome.action.setBadgeText({ tabId, text: "×" });
  setTimeout(() => chrome.action.setBadgeText({ tabId, text: "" }), 1500);
}
