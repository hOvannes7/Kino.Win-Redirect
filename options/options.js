const input = document.getElementById("domain");
const preview = document.getElementById("preview");
const status = document.getElementById("status");

function showStatus(text, ok) {
  status.textContent = text;
  status.className = ok ? "ok" : "err";
}

function updatePreview() {
  const domain = KinoRedirect.normalizeDomain(input.value);
  preview.textContent = domain ? `Ссылка: https://${domain}/film/301/` : "";
}

KinoRedirect.getDomain().then((domain) => {
  input.value = domain;
  updatePreview();
});

input.addEventListener("input", () => { updatePreview(); status.textContent = ""; });

document.getElementById("save").addEventListener("click", async () => {
  const domain = KinoRedirect.normalizeDomain(input.value);
  if (!domain) return showStatus("Неверный домен. Пример: kinokino.win", false);
  await chrome.storage.sync.set({ domain });
  input.value = domain;
  updatePreview();
  showStatus("Сохранено ✓", true);
});

document.getElementById("reset").addEventListener("click", async () => {
  await chrome.storage.sync.remove("domain");
  input.value = KinoRedirect.DEFAULT_DOMAIN;
  updatePreview();
  showStatus("Сброшено ✓", true);
});
