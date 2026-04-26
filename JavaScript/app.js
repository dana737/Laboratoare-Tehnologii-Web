const body = document.body;

const STORAGE_KEYS = {
  flash: "lab3-flash",
  theme: "lab3-theme",
  lastRequest: "lab3-last-request",
  requests: "lab3-requests",
  selectedCompany: "lab3-selected-company",
  conversations: "lab3-conversations",
  reviews: "lab3-reviews",
  sponsoredIssue: "lab3-sponsored-issue",
  issues: "lab3-issues",
  issueStats: "lab3-issue-stats",
  dashboard: "lab3-dashboard",
  companyProfile: "lab3-company-profile",
  user: "lab3-user"
};

const DEFAULT_CONVERSATIONS = {
  "InstalExpert SRL": [
    { from: "other", text: "Buna! Am vazut cererea ta pentru reparatie.", time: "10:02" },
    { from: "me", text: "Salut. Am nevoie azi dupa 16:00.", time: "10:05" },
    { from: "other", text: "Perfect, putem ajunge. Costul estimat este 350 lei.", time: "10:07" },
    { from: "me", text: "Super, confirm.", time: "10:08" }
  ],
  CleanPro: [
    { from: "other", text: "Pret orientativ pentru curatenie generala: 500 lei.", time: "09:41" }
  ],
  "NordIT Service": [
    { from: "other", text: "Trimitem oferta detaliata pe email in 15 minute.", time: "08:55" }
  ]
};

function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

function qsa(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeText(value) {
  return (value || "").trim();
}

function slugify(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getNowTime() {
  return new Date().toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function queueFlashMessage(message) {
  if (message) {
    sessionStorage.setItem(STORAGE_KEYS.flash, message);
  }
}

function showNotification(message, tone = "info") {
  const tray = qs(".notification-tray");

  if (!tray || !message) {
    return;
  }

  const item = document.createElement("div");
  item.className = `notification-item notification-${tone}`;
  item.textContent = message;
  tray.prepend(item);

  window.setTimeout(() => {
    item.classList.add("notification-hide");
    window.setTimeout(() => item.remove(), 260);
  }, 3800);
}

function initNotificationTray() {
  if (qs(".notification-tray")) {
    return;
  }

  const tray = document.createElement("div");
  tray.className = "notification-tray";
  document.body.append(tray);
}

function ensureModal() {
  let overlay = qs(".modal-overlay");

  if (overlay) {
    return overlay;
  }

  overlay = document.createElement("div");
  overlay.className = "modal-overlay is-hidden";
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="lab3-modal-title">
      <h3 id="lab3-modal-title">Confirmare</h3>
      <p class="modal-text"></p>
      <div class="modal-actions">
        <button class="btn" type="button" data-modal-cancel>Anuleaza</button>
        <button class="btn accent" type="button" data-modal-confirm>Continua</button>
      </div>
    </div>
  `;
  document.body.append(overlay);
  return overlay;
}

function openConfirmModal(message, onConfirm) {
  const overlay = ensureModal();
  const text = qs(".modal-text", overlay);
  const cancelButton = qs("[data-modal-cancel]", overlay);
  const confirmButton = qs("[data-modal-confirm]", overlay);

  text.textContent = message;
  overlay.classList.remove("is-hidden");

  function close() {
    overlay.classList.add("is-hidden");
    cancelButton.removeEventListener("click", handleCancel);
    confirmButton.removeEventListener("click", handleConfirm);
    overlay.removeEventListener("click", handleBackdrop);
  }

  function handleCancel() {
    close();
  }

  function handleConfirm() {
    close();
    onConfirm?.();
  }

  function handleBackdrop(event) {
    if (event.target === overlay) {
      close();
    }
  }

  cancelButton.addEventListener("click", handleCancel);
  confirmButton.addEventListener("click", handleConfirm);
  overlay.addEventListener("click", handleBackdrop);
}

function initThemeToggle() {
  const nav = qs(".nav-actions");

  if (!nav) {
    return;
  }

  let toggle = qs(".theme-toggle", nav);

  if (!toggle) {
    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "tab theme-toggle";
    nav.append(toggle);
  }

  function applyTheme(theme) {
    document.body.dataset.theme = theme;
    toggle.textContent = theme === "dark" ? "Mod luminos" : "Mod intunecat";
  }

  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || "light";
  applyTheme(savedTheme);

  toggle.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
    applyTheme(nextTheme);
    showNotification(`Tema ${nextTheme === "dark" ? "intunecata" : "luminoasa"} a fost activata.`);
  });
}

function initSimulatedNotifications() {
  const messages = {
    index: [
      "Sistemul a gasit 3 firme cu raspuns rapid in zona selectata.",
      "Un nou furnizor verificat a fost adaugat in categoria Reparatii."
    ],
    messages: [
      "InstalExpert SRL a citit ultimul tau mesaj.",
      "CleanPro a trimis o oferta actualizata."
    ],
    "company-account": [
      "Ai primit o cerere noua din Chisinau Centru.",
      "Profilul firmei a urcat in topul cautarilor de azi."
    ]
  };

  const pageMessages = messages[body.dataset.page];

  if (!pageMessages) {
    return;
  }

  let index = 0;

  window.setTimeout(() => {
    showNotification(pageMessages[index], "info");
    index = (index + 1) % pageMessages.length;
  }, 1800);

  window.setInterval(() => {
    showNotification(pageMessages[index], index % 2 === 0 ? "info" : "success");
    index = (index + 1) % pageMessages.length;
  }, 12000);
}

function showFlashMessage(message) {
  const page = qs("main");

  if (!page || !message) {
    return;
  }

  const banner = document.createElement("div");
  banner.className = "flash-message";
  banner.textContent = message;
  page.prepend(banner);

  window.setTimeout(() => {
    banner.remove();
  }, 4000);
}

function restoreFlashMessage() {
  const message = sessionStorage.getItem(STORAGE_KEYS.flash);

  if (!message) {
    return;
  }

  sessionStorage.removeItem(STORAGE_KEYS.flash);
  showFlashMessage(message);
}

function validateField(field) {
  const value = normalizeText(field.value);
  let isValid = field.checkValidity();

  if (field.type === "password" && value && value.length < 6) {
    isValid = false;
    field.setCustomValidity("Parola trebuie sa aiba minimum 6 caractere.");
  } else if (field.type === "tel" && value && value.replace(/\D/g, "").length < 8) {
    isValid = false;
    field.setCustomValidity("Numarul de telefon este prea scurt.");
  } else {
    field.setCustomValidity("");
  }

  field.classList.toggle("field-error", !isValid);
  return isValid;
}

function usesCgiSubmit(form) {
  return form?.dataset.serverSubmit === "cgi";
}

function initValidation() {
  qsa("form").forEach((form) => {
    const fields = qsa("input, select, textarea", form);

    fields.forEach((field) => {
      field.addEventListener("input", () => validateField(field));
      field.addEventListener("change", () => validateField(field));
    });

    form.addEventListener("submit", (event) => {
      const invalidFields = fields.filter((field) => !validateField(field));

      if (invalidFields.length > 0) {
        event.preventDefault();
        invalidFields[0].focus();
        showFlashMessage("Completeaza toate campurile obligatorii inainte de trimitere.");
      } else if (usesCgiSubmit(form)) {
        queueFlashMessage("Formularul a fost trimis catre server pentru procesare CGI.");
      }
    });
  });
}

function getSelectedCompany() {
  return localStorage.getItem(STORAGE_KEYS.selectedCompany) || "InstalExpert SRL";
}

function setSelectedCompany(company) {
  const name = normalizeText(company);

  if (name) {
    localStorage.setItem(STORAGE_KEYS.selectedCompany, name);
  }
}

function navigateTo(url, message) {
  queueFlashMessage(message);
  window.location.href = url;
}

function getConversations() {
  return readJSON(STORAGE_KEYS.conversations, DEFAULT_CONVERSATIONS);
}

function saveConversations(conversations) {
  writeJSON(STORAGE_KEYS.conversations, conversations);
}

function ensureConversation(conversations, company) {
  if (!conversations[company]) {
    conversations[company] = [
      {
        from: "other",
        text: "Salut! Firul de discutie a fost deschis. Scrie-ne cateva detalii.",
        time: getNowTime()
      }
    ];
  }
}

function detectCompanyFromElement(element) {
  if (!element) {
    return "";
  }

  const explicit = element.dataset.company;

  if (explicit) {
    return explicit;
  }

  const card = element.closest(".list-item, .firm-card, .card, article");
  const title = card?.querySelector(".item-title")?.textContent;

  if (title) {
    return normalizeText(title);
  }

  const heading = qs("h1");
  const headingText = heading ? normalizeText(heading.textContent) : "";

  if (headingText && !headingText.toLowerCase().includes("alege compania")) {
    return headingText;
  }

  return "";
}

function initHomePage() {
  if (body.dataset.page !== "index") {
    return;
  }

  const searchInput = qs(".search input");
  const citySelect = qs(".pill select");
  const resetButton = qs(".search .small-btn");
  const searchButton = qs(".search-row .btn.accent");
  const companyCards = qsa("aside.card .list .list-item");
  const categoryLinks = qsa(".left-menu a");
  const statsBadge = qs(".stats-row .badge");

  if (!searchInput || !citySelect) {
    return;
  }

  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const city = citySelect.value.toLowerCase();
    let visibleCount = 0;

    companyCards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const matchesQuery = !query || text.includes(query);
      const matchesCity = city === "toata moldova" || text.includes(city);
      const isVisible = matchesQuery && matchesCity;

      card.classList.toggle("is-hidden", !isVisible);

      if (isVisible) {
        visibleCount += 1;
      }
    });

    categoryLinks.forEach((link) => {
      const matchesQuery = !query || link.textContent.toLowerCase().includes(query);
      link.classList.toggle("is-hidden", !matchesQuery);
    });

    if (statsBadge) {
      statsBadge.textContent = `${visibleCount || companyCards.length} furnizori potriviti pentru filtrul curent`;
    }
  }

  searchInput.addEventListener("input", applyFilters);
  citySelect.addEventListener("change", applyFilters);

  resetButton?.addEventListener("click", (event) => {
    event.preventDefault();
    searchInput.value = "";
    citySelect.value = "Toata Moldova";
    applyFilters();
  });

  searchButton?.addEventListener("click", (event) => {
    event.preventDefault();

    const visibleCards = companyCards.filter((card) => !card.classList.contains("is-hidden"));
    const singleMatch = visibleCards.length === 1 ? qs(".item-title", visibleCards[0])?.textContent : "";

    if (singleMatch) {
      setSelectedCompany(singleMatch);
    }

    writeJSON("lab3-home-filter", {
      query: searchInput.value.trim(),
      city: citySelect.value
    });

    openConfirmModal("Vrei sa transferi filtrul curent in formularul de oferta?", () => {
      navigateTo(
        "HTML/cere-oferta.html",
        "Am transferat filtrul tau in formularul de oferta."
      );
    });
  });

  categoryLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      writeJSON("lab3-home-filter", {
        query: normalizeText(link.textContent),
        city: citySelect.value
      });
      navigateTo(
        "HTML/cere-oferta.html",
        `Am selectat categoria "${normalizeText(link.textContent)}" pentru cererea ta.`
      );
    });
  });

  qsa('a[href*="serviciu-"], a[href="HTML/cere-oferta.html"]', document).forEach((link) => {
    link.addEventListener("click", () => {
      const company = detectCompanyFromElement(link);

      if (company) {
        setSelectedCompany(company);
      }
    });
  });

  applyFilters();
}

function initServicePageLinks() {
  if (body.dataset.page !== "service") {
    return;
  }

  qsa('a[href$="cere-oferta.html"], a[href$="mesaje.html"], a[href*="serviciu-"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const company = detectCompanyFromElement(link);

      if (company) {
        setSelectedCompany(company);
      }

      if (link.getAttribute("href")?.endsWith("mesaje.html")) {
        event.preventDefault();
        navigateTo("mesaje.html", `Ai deschis conversatia cu ${getSelectedCompany()}.`);
      }

      if (link.getAttribute("href")?.endsWith("cere-oferta.html")) {
        event.preventDefault();
        navigateTo("cere-oferta.html", `Cererea ta va fi precompletata pentru ${getSelectedCompany()}.`);
      }
    });
  });
}

function fillOfferPreview(data) {
  const items = qsa(".card .list .list-item");

  if (items.length < 3) {
    return;
  }

  items[0].innerHTML = `<strong>Client:</strong> ${data.clientType || "persoana fizica"}`;
  items[1].innerHTML = `<strong>Zona:</strong> ${data.city || "Chisinau"}${data.category ? ` · ${data.category}` : ""}`;
  items[2].innerHTML = `<strong>Status:</strong> ${data.status || "asteapta oferte"}`;

  let companyCard = qs(".selected-company-card");

  if (!companyCard) {
    companyCard = document.createElement("div");
    companyCard.className = "list-item selected-company-card";
    qs(".gradient-card")?.before(companyCard);
  }

  if (data.company) {
    companyCard.innerHTML = `<strong>Furnizor vizat:</strong> ${data.company}`;
  } else {
    companyCard.remove();
  }
}

function initOfferPage() {
  if (body.dataset.page !== "offer") {
    return;
  }

  const form = qs("form");

  if (!form) {
    return;
  }

  const category = qs('select[name="category"]', form);
  const urgency = qs('select[name="urgency"]', form);
  const description = qs('textarea[name="description"]', form);
  const city = qs('select[name="city"]', form);
  const phone = qs('input[name="phone"]', form);
  const budget = qs('input[name="budget"]', form);
  const companyField = qs('input[name="company"]', form);
  const goMessagesButtons = qsa('.item-actions a[href="mesaje.html"], .card-body.list > a[href="mesaje.html"]');
  const homeFilter = readJSON("lab3-home-filter", null);
  const sponsoredIssue = localStorage.getItem(STORAGE_KEYS.sponsoredIssue);
  const selectedCompany = getSelectedCompany();

  if (homeFilter?.city && qsa("option", city).some((option) => option.value === homeFilter.city)) {
    city.value = homeFilter.city;
  }

  if (homeFilter?.query) {
    const query = homeFilter.query.toLowerCase();

    if (query.includes("it")) {
      category.value = "IT";
    } else if (query.includes("curat")) {
      category.value = "Curatenie";
    } else if (query.includes("transport")) {
      category.value = "Transport";
    } else {
      category.value = "Reparatii";
    }
  }

  if (sponsoredIssue && !description.value) {
    description.value = `Dorim sponsorizarea problemei locale: ${sponsoredIssue}.`;
    budget.value = "1000-2500 lei";
  }

  if (companyField) {
    companyField.value = selectedCompany;
  }

  function updatePreview() {
    fillOfferPreview({
      clientType: "persoana fizica",
      city: city.value,
      category: category.value,
      status: urgency.value === "Azi" ? "urgenta ridicata" : "asteapta oferte",
      company: selectedCompany
    });
  }

  [category, urgency, description, city, phone, budget].forEach((field) => {
    field?.addEventListener("input", updatePreview);
    field?.addEventListener("change", updatePreview);
  });

  form.addEventListener("submit", (event) => {
    const fields = qsa("input, select, textarea", form);
    const invalidFields = fields.filter((field) => !validateField(field));

    if (invalidFields.length > 0) {
      event.preventDefault();
      invalidFields[0].focus();
      return;
    }

    if (usesCgiSubmit(form)) {
      queueFlashMessage(`Cererea pentru ${selectedCompany} este procesata pe server.`);
      return;
    }

    event.preventDefault();

    const request = {
      id: Date.now(),
      company: selectedCompany,
      category: category.value,
      urgency: urgency.value,
      description: description.value.trim(),
      city: city.value,
      phone: phone.value.trim(),
      budget: budget.value.trim() || "buget flexibil",
      syncedToMessages: false
    };

    const requests = readJSON(STORAGE_KEYS.requests, []);
    requests.unshift(request);
    writeJSON(STORAGE_KEYS.requests, requests);
    writeJSON(STORAGE_KEYS.lastRequest, request);
    navigateTo("mesaje.html", `Cererea pentru ${request.company} a fost trimisa cu succes.`);
  });

  goMessagesButtons.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const existingRequest = readJSON(STORAGE_KEYS.lastRequest, null);

      if (!existingRequest && !description.value.trim()) {
        showFlashMessage("Completeaza mai intai cateva detalii pentru a continua spre mesaje.");
        description.focus();
        return;
      }

      if (!existingRequest) {
        writeJSON(STORAGE_KEYS.lastRequest, {
          id: Date.now(),
          company: selectedCompany,
          category: category.value,
          urgency: urgency.value,
          description: description.value.trim(),
          city: city.value,
          phone: phone.value.trim(),
          budget: budget.value.trim() || "buget flexibil",
          syncedToMessages: false
        });
      }

      navigateTo("mesaje.html", `Ai deschis mesajele pentru ${selectedCompany}.`);
    });
  });

  updatePreview();
}

function syncRequestIntoConversations(conversations) {
  const request = readJSON(STORAGE_KEYS.lastRequest, null);

  if (!request || request.syncedToMessages) {
    return conversations;
  }

  const company = request.company || getSelectedCompany();
  ensureConversation(conversations, company);
  conversations[company].push({
    from: "me",
    text: `Cerere noua: ${request.description} (${request.city}, ${request.budget}).`,
    time: getNowTime()
  });
  conversations[company].push({
    from: "other",
    text: `Am primit cererea pentru categoria ${request.category}. Revenim rapid cu oferta.`,
    time: getNowTime()
  });

  request.syncedToMessages = true;
  writeJSON(STORAGE_KEYS.lastRequest, request);
  saveConversations(conversations);
  return conversations;
}

function renderMessages(messages, container) {
  container.innerHTML = "";

  messages.forEach((message) => {
    const item = document.createElement("div");
    item.className = `msg ${message.from}`;
    item.innerHTML = `${message.text}<span class="msg-time">${message.time || ""}</span>`;
    container.append(item);
  });

  container.scrollTop = container.scrollHeight;
}

function initMessagesPage() {
  if (body.dataset.page !== "messages") {
    return;
  }

  const asideList = qs(".grid-chat aside .list");
  const title = qs(".chat-box .card-head h2");
  const badge = qs(".chat-box .badge");
  const messagesBox = qs(".chat-messages");
  const input = qs(".chat-input input");
  const sendButton = qs(".chat-input .btn");

  if (!asideList || !title || !messagesBox || !input || !sendButton) {
    return;
  }

  const conversations = syncRequestIntoConversations(getConversations());
  let activeCompany = getSelectedCompany();

  ensureConversation(conversations, activeCompany);

  function renderConversationList() {
    asideList.innerHTML = "";

    Object.entries(conversations).forEach(([company, messages]) => {
      const item = document.createElement("div");
      const preview = messages[messages.length - 1]?.text || "Deschide conversatia";
      item.className = `list-item conversation-item${company === activeCompany ? " conversation-active" : ""}`;
      item.innerHTML = `<div class="item-title">${company}</div><div class="item-meta">${preview}</div>`;
      item.addEventListener("click", () => {
        activeCompany = company;
        setSelectedCompany(company);
        renderConversationList();
        renderActiveConversation();
      });
      asideList.append(item);
    });
  }

  function renderActiveConversation() {
    title.textContent = activeCompany;
    badge.textContent = "Online";
    renderMessages(conversations[activeCompany], messagesBox);
  }

  function sendCurrentMessage() {
    const text = input.value.trim();

    if (!text) {
      showFlashMessage("Scrie un mesaj inainte de a apasa Trimite.");
      return;
    }

    conversations[activeCompany].push({
      from: "me",
      text,
      time: getNowTime()
    });

    conversations[activeCompany].push({
      from: "other",
      text: "Mesaj primit. Un operator va reveni imediat cu detalii.",
      time: getNowTime()
    });

    saveConversations(conversations);
    input.value = "";
    renderConversationList();
    renderActiveConversation();
    showNotification(`Mesaj trimis catre ${activeCompany}.`, "success");
  }

  sendButton.addEventListener("click", (event) => {
    event.preventDefault();
    sendCurrentMessage();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendCurrentMessage();
    }
  });

  renderConversationList();
  renderActiveConversation();
}

function parseBadgeStats(text) {
  const match = text.match(/([\d.]+)\s*⭐\s*\((\d+)\)/);

  if (!match) {
    return { average: 5, count: 0 };
  }

  return {
    average: Number(match[1]),
    count: Number(match[2])
  };
}

function createReviewArticle(company, review) {
  const article = document.createElement("article");
  article.id = `firma-${slugify(company)}`;
  article.className = "list-item";
  article.dataset.company = company;
  article.innerHTML = `
    <div class="item-top"><span class="item-title">${company}</span><span class="badge">5.0 ⭐ (1)</span></div>
    <div class="item-meta">Companie adaugata din fluxul de recenzii</div>
    <p class="muted review-entry" data-review-id="${review.id}" style="margin-top:.35rem;">"${review.text}" - ${review.author}</p>
    <div class="item-actions"><a class="small-btn" href="serviciu.html">Vezi profil firma</a></div>
  `;
  return article;
}

function appendReviewToArticle(article, review) {
  if (article.querySelector(`[data-review-id="${review.id}"]`)) {
    return;
  }

  const badge = qs(".badge", article);
  const stats = parseBadgeStats(badge.textContent);
  const newAverage = ((stats.average * stats.count) + review.stars) / (stats.count + 1);
  badge.textContent = `${newAverage.toFixed(1)} ⭐ (${stats.count + 1})`;

  const entry = document.createElement("p");
  entry.className = "muted review-entry";
  entry.dataset.reviewId = String(review.id);
  entry.style.marginTop = ".2rem";
  entry.textContent = `"${review.text}" - ${review.author}`;
  const actions = qs(".item-actions", article);
  actions.before(entry);
}

function initReviewsPage() {
  if (body.dataset.page !== "reviews") {
    return;
  }

  const reviewsList = qs(".grid-2 .card .list");
  const filterInput = qs('input[list="firme-list"]');
  const addReviewLink = qs(".small-btn.accent");
  const asideList = qsa(".grid-2 .card")[1]?.querySelector(".card-body");

  if (!reviewsList || !filterInput || !asideList) {
    return;
  }

  const savedReviews = readJSON(STORAGE_KEYS.reviews, []);

  function getArticleByCompany(company) {
    return qsa("article", reviewsList).find((article) => {
      return normalizeText(qs(".item-title", article)?.textContent) === company;
    });
  }

  function renderSavedReviews() {
    savedReviews.forEach((review) => {
      let article = getArticleByCompany(review.company);

      if (!article) {
        article = createReviewArticle(review.company, review);
        reviewsList.append(article);
      } else if (!article.querySelector(`[data-review-id="${review.id}"]`)) {
        appendReviewToArticle(article, review);
      }
    });
  }

  function filterReviews() {
    const query = filterInput.value.trim().toLowerCase();

    qsa("article", reviewsList).forEach((article) => {
      const company = article.textContent.toLowerCase();
      const visible = !query || company.includes(query);
      article.classList.toggle("is-hidden", !visible);
      article.classList.toggle("soft-highlight", visible && query.length > 1);
    });
  }

  const formWrap = document.createElement("div");
  formWrap.className = "review-form";
  formWrap.innerHTML = `
    <h3>Adauga recenzie</h3>
    <form class="field-grid">
      <div class="field span-2">
        <label>Companie</label>
        <input name="company" type="text" placeholder="Ex: InstalExpert SRL" value="${getSelectedCompany()}">
      </div>
      <div class="field">
        <label>Numele tau</label>
        <input name="author" type="text" placeholder="Ex: Ana M." required>
      </div>
      <div class="field">
        <label>Stele</label>
        <select name="stars" class="is-hidden">
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
        </select>
        <div class="star-rating" data-rating="5" aria-label="Alege numarul de stele">
          <button type="button" class="star is-active" data-star="1">★</button>
          <button type="button" class="star is-active" data-star="2">★</button>
          <button type="button" class="star is-active" data-star="3">★</button>
          <button type="button" class="star is-active" data-star="4">★</button>
          <button type="button" class="star is-active" data-star="5">★</button>
        </div>
      </div>
      <div class="field span-2">
        <label>Text recenzie</label>
        <textarea name="text" required placeholder="Descrie experienta ta cu firma."></textarea>
      </div>
      <div class="span-2 item-actions">
        <button class="btn accent" type="submit">Publica recenzia</button>
      </div>
    </form>
  `;
  asideList.append(formWrap);

  const reviewForm = qs("form", formWrap);
  const starsSelect = qs('[name="stars"]', reviewForm);
  const starButtons = qsa(".star", reviewForm);

  function paintStars(value) {
    starButtons.forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.star) <= value);
    });
  }

  starButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const value = Number(button.dataset.star);
      starsSelect.value = String(value);
      paintStars(value);
      showNotification(`Ai selectat ${value} stele pentru recenzie.`);
    });
  });

  reviewForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const fields = qsa("input, select, textarea", reviewForm);
    const invalidFields = fields.filter((field) => !validateField(field));

    if (invalidFields.length > 0) {
      invalidFields[0].focus();
      return;
    }

    const review = {
      id: Date.now(),
      company: normalizeText(qs('[name="company"]', reviewForm).value),
      author: normalizeText(qs('[name="author"]', reviewForm).value),
      stars: Number(qs('[name="stars"]', reviewForm).value),
      text: normalizeText(qs('[name="text"]', reviewForm).value)
    };

    let article = getArticleByCompany(review.company);

    if (!article) {
      article = createReviewArticle(review.company, review);
      reviewsList.prepend(article);
    } else {
      appendReviewToArticle(article, review);
    }

    savedReviews.unshift(review);
    writeJSON(STORAGE_KEYS.reviews, savedReviews);
    setSelectedCompany(review.company);
    reviewForm.reset();
    qs('[name="company"]', reviewForm).value = review.company;
    starsSelect.value = "5";
    paintStars(5);
    showFlashMessage(`Recenzia pentru ${review.company} a fost publicata.`);
    showNotification(`Recenzie noua publicata pentru ${review.company}.`, "success");
    filterInput.value = review.company;
    filterReviews();
  });

  addReviewLink?.addEventListener("click", (event) => {
    event.preventDefault();
    formWrap.scrollIntoView({ behavior: "smooth", block: "start" });
    qs('[name="company"]', reviewForm).focus();
  });

  filterInput.addEventListener("input", filterReviews);
  paintStars(5);
  renderSavedReviews();
  filterReviews();
}

function updateIssueMeta(article, stats) {
  const meta = qs(".item-meta", article);
  const base = meta.dataset.baseMeta || meta.textContent;
  meta.dataset.baseMeta = base.split(" · ")[0];
  meta.textContent = `${meta.dataset.baseMeta} · ${stats.support} sustineri · ${stats.sponsors} sponsori`;
}

function getIssueStats() {
  return readJSON(STORAGE_KEYS.issueStats, {});
}

function saveIssueStats(stats) {
  writeJSON(STORAGE_KEYS.issueStats, stats);
}

function decorateIssueArticle(article, statsMap) {
  const title = normalizeText(qs(".item-title", article)?.textContent);

  if (!title) {
    return;
  }

  const stats = statsMap[title] || { support: 0, sponsors: 0 };
  updateIssueMeta(article, stats);

  const supportButton = qsa(".small-btn", article)[0];
  const sponsorButton = qsa(".small-btn", article)[1];

  supportButton?.addEventListener("click", (event) => {
    event.preventDefault();
    stats.support += 1;
    statsMap[title] = stats;
    updateIssueMeta(article, stats);
    saveIssueStats(statsMap);
    showFlashMessage(`Ai sustinut problema "${title}".`);
  });

  sponsorButton?.addEventListener("click", (event) => {
    event.preventDefault();
    stats.sponsors += 1;
    statsMap[title] = stats;
    updateIssueMeta(article, stats);
    saveIssueStats(statsMap);
    localStorage.setItem(STORAGE_KEYS.sponsoredIssue, title);
    navigateTo("cere-oferta.html", `Am preluat sponsorizarea pentru "${title}" in formularul de oferta.`);
  });
}

function createIssueArticle(issue, statsMap) {
  const article = document.createElement("article");
  article.className = "list-item";
  article.innerHTML = `
    <div class="item-top"><span class="item-title">${issue.title}</span><span class="badge">Nou</span></div>
    <div class="item-meta">${issue.city}</div>
    <div class="item-actions">
      <a class="small-btn primary" href="mesaje.html">Sustin</a>
      <a class="small-btn accent" href="cere-oferta.html">Sponsorizeaza</a>
    </div>
  `;
  decorateIssueArticle(article, statsMap);
  return article;
}

function initIssuesPage() {
  if (body.dataset.page !== "issues") {
    return;
  }

  const issueList = qs(".card .list");
  const form = qs("form");
  const metrics = qsa(".metric-strip .m b");

  if (!issueList || !form) {
    return;
  }

  const statsMap = getIssueStats();
  const savedIssues = readJSON(STORAGE_KEYS.issues, []);

  qsa("article", issueList).forEach((article) => decorateIssueArticle(article, statsMap));

  savedIssues.forEach((issue) => {
    if (!qsa("article", issueList).some((article) => normalizeText(qs(".item-title", article)?.textContent) === issue.title)) {
      issueList.append(createIssueArticle(issue, statsMap));
    }
  });

  form.addEventListener("submit", (event) => {
    const fields = qsa("input, select, textarea", form);
    const invalidFields = fields.filter((field) => !validateField(field));

    if (invalidFields.length > 0) {
      event.preventDefault();
      invalidFields[0].focus();
      return;
    }

    if (usesCgiSubmit(form)) {
      queueFlashMessage("Sesizarea este trimisa spre procesare CGI.");
      return;
    }

    event.preventDefault();

    const issue = {
      id: Date.now(),
      title: normalizeText(qs('input[type="text"]', form).value),
      city: qs("select", form).value,
      description: normalizeText(qs("textarea", form).value)
    };

    savedIssues.unshift(issue);
    writeJSON(STORAGE_KEYS.issues, savedIssues);
    issueList.prepend(createIssueArticle(issue, statsMap));

    if (metrics[0]) {
      metrics[0].textContent = String(Number(metrics[0].textContent) + 1);
    }

    form.reset();
    showFlashMessage(`Sesizarea "${issue.title}" a fost adaugata in lista publica.`);
    showNotification(`Sesizare noua: ${issue.title}.`, "success");
  });
}

function createTimelineItem(text) {
  const item = document.createElement("div");
  item.className = "timeline-item";
  item.innerHTML = `<strong>${getNowTime()}</strong> ${text}`;
  return item;
}

function initCompanyDashboard() {
  if (body.dataset.page !== "company-account") {
    return;
  }

  const metricValues = qsa(".metric-strip .m b");
  const requestArticles = qsa(".grid-2 .list article");
  const timeline = qs(".timeline");
  const instantButton = qs('.card-head a[href="mesaje.html"]');
  const profile = readJSON(STORAGE_KEYS.companyProfile, null);

  if (profile) {
    const description = qs(".hero-mini");
    if (description) {
      description.textContent = `${profile.name} isi gestioneaza cererile, conversatiile si performanta dintr-un singur loc.`;
    }
  }

  requestArticles.forEach((article) => {
    const title = normalizeText(qs(".item-title", article)?.textContent);
    const badge = qs(".badge", article);
    const detailButton = qsa(".small-btn", article)[0];
    const actionButton = qsa(".small-btn", article)[1];

    detailButton?.addEventListener("click", (event) => {
      event.preventDefault();
      let panel = qs(".mini-note", article);

      if (!panel) {
        panel = document.createElement("div");
        panel.className = "mini-note";
        panel.textContent = `Detalii rapide: client activ, raspuns estimat sub 15 minute, prioritate setata pentru "${title}".`;
        qs(".item-actions", article).after(panel);
      } else {
        panel.remove();
      }
    });

    actionButton?.addEventListener("click", (event) => {
      event.preventDefault();
      openConfirmModal(`Confirmi ca vrei sa preiei cererea "${title}"?`, () => {
        if (badge) {
          badge.textContent = "Preluata";
        }
        article.classList.add("soft-highlight");
        if (metricValues[0]) {
          metricValues[0].textContent = String(Math.max(0, Number(metricValues[0].textContent) - 1));
        }
        if (metricValues[1]) {
          metricValues[1].textContent = String(Number(metricValues[1].textContent) + 1);
        }
        timeline?.prepend(createTimelineItem(`Ai procesat cererea "${title}".`));
        showNotification(`Cererea "${title}" a fost preluata.`, "success");
        navigateTo("mesaje.html", `Ai deschis chatul pentru cererea "${title}".`);
      });
    });
  });

  instantButton?.addEventListener("click", (event) => {
    event.preventDefault();
    navigateTo("mesaje.html", "Ai deschis inbox-ul pentru a raspunde rapid solicitarilor noi.");
  });
}

function initAddServicePage() {
  if (body.dataset.page !== "add-service") {
    return;
  }

  const form = qs("form");

  form?.addEventListener("submit", (event) => {
    const fields = qsa("input, select, textarea", form);
    const invalidFields = fields.filter((field) => !validateField(field));

    if (invalidFields.length > 0) {
      event.preventDefault();
      invalidFields[0].focus();
      return;
    }

    if (usesCgiSubmit(form)) {
      queueFlashMessage("Profilul firmei este trimis spre salvare CGI.");
      return;
    }

    event.preventDefault();

    const profile = {
      name: normalizeText(qs('[name="name"]', form).value),
      phone: normalizeText(qs('[name="phone"]', form).value),
      city: qs('[name="city"]', form).value,
      email: normalizeText(qs('[name="email"]', form).value),
      description: normalizeText(qs('[name="desc"]', form).value),
      service1: normalizeText(qs('[name="service1"]', form).value),
      price1: normalizeText(qs('[name="price1"]', form).value),
      service2: normalizeText(qs('[name="service2"]', form).value),
      price2: normalizeText(qs('[name="price2"]', form).value)
    };

    writeJSON(STORAGE_KEYS.companyProfile, profile);
    setSelectedCompany(profile.name);
    navigateTo("cont-firma.html", `Profilul firmei ${profile.name} a fost salvat.`);
  });
}

function initAuthPage() {
  if (body.dataset.page !== "auth") {
    return;
  }

  const forms = qsa("form");

  forms.forEach((form, index) => {
    form.addEventListener("submit", (event) => {
      const fields = qsa("input, select, textarea", form);
      const invalidFields = fields.filter((field) => !validateField(field));

      if (invalidFields.length > 0) {
        event.preventDefault();
        invalidFields[0].focus();
        return;
      }

      if (usesCgiSubmit(form)) {
        queueFlashMessage("Datele de autentificare au fost trimise spre procesare CGI.");
        return;
      }

      event.preventDefault();

      const emailField = qs('input[type="email"]', form);
      const nameField = qs('input[type="text"]', form);
      const user = {
        email: normalizeText(emailField?.value),
        name: normalizeText(nameField?.value) || "Utilizator",
        mode: index === 0 ? "login" : "register"
      };

      writeJSON(STORAGE_KEYS.user, user);

      if (index === 0) {
        navigateTo("../index.html", `Te-ai autentificat cu ${user.email}.`);
      } else {
        navigateTo("cont-firma.html", `Contul pentru ${user.name} a fost creat.`);
      }
    });
  });
}

restoreFlashMessage();
initNotificationTray();
initThemeToggle();
initValidation();
initHomePage();
initServicePageLinks();
initOfferPage();
initMessagesPage();
initReviewsPage();
initIssuesPage();
initCompanyDashboard();
initAddServicePage();
initAuthPage();
initSimulatedNotifications();
