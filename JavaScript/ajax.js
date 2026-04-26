(function () {
  function showMessage(message, tone) {
    if (typeof window.showFlashMessage === "function") {
      window.showFlashMessage(message);
      return;
    }

    const existing = document.querySelector(".ajax-banner");
    if (existing) {
      existing.remove();
    }

    const banner = document.createElement("div");
    banner.className = `flash-message ajax-banner${tone === "error" ? " field-error" : ""}`;
    banner.textContent = message;
    const main = document.querySelector("main");
    main?.prepend(banner);
  }

  async function submitAjaxForm(form) {
    const formData = new FormData(form);
    const response = await fetch(form.action, {
      method: form.method || "POST",
      body: new URLSearchParams(formData),
      headers: {
        Accept: "application/json"
      }
    });

    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || "Cererea nu a putut fi procesata.");
    }

    showMessage(payload.message, "success");
    form.reset();

    window.setTimeout(() => {
      if (payload.dashboard_url) {
        window.location.href = payload.dashboard_url;
      }
    }, 900);
  }

  function renderList(containerId, items, renderItem) {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    if (!items.length) {
      container.innerHTML = '<div class="list-item"><div class="item-title">Nu exista inregistrari inca.</div><div class="item-meta">Trimite un formular AJAX pentru a vedea datele aici.</div></div>';
      return;
    }

    container.innerHTML = items.map(renderItem).join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  async function loadDashboard() {
    if (document.body.dataset.page !== "ajax-dashboard") {
      return;
    }

    const response = await fetch("api/dashboard.php", {
      headers: {
        Accept: "application/json"
      }
    });
    const payload = await response.json();

    const statsBox = document.getElementById("ajax-stats");
    if (statsBox) {
      statsBox.innerHTML = `
        <span class="badge">${payload.stats.offers} cereri oferta</span>
        <span class="badge">${payload.stats.companies} profile firma</span>
        <span class="badge">${payload.stats.issues} sesizari</span>
        <span class="badge">${payload.stats.users} conturi noi</span>
        <span class="badge">${payload.stats.logins} login-uri</span>
      `;
    }

    document.querySelectorAll("[data-count]").forEach((element) => {
      const key = element.getAttribute("data-count");
      element.textContent = String(payload.stats[key] || 0);
    });

    renderList("offers-list", payload.offers, (item) => `
      <article class="list-item">
        <div class="item-top"><span class="item-title">${escapeHtml(item.company)}</span><span class="badge">${escapeHtml(item.category)}</span></div>
        <div class="item-meta">${escapeHtml(item.city)} · ${escapeHtml(item.budget)} · ${escapeHtml(item.submitted_at)}</div>
        <p class="muted" style="margin-top:.45rem;">${escapeHtml(item.description)}</p>
      </article>
    `);

    renderList("companies-list", payload.companies, (item) => `
      <article class="list-item">
        <div class="item-top"><span class="item-title">${escapeHtml(item.name)}</span><span class="badge">${escapeHtml(item.city)}</span></div>
        <div class="item-meta">${escapeHtml(item.phone)} · ${escapeHtml(item.submitted_at)}</div>
        <p class="muted" style="margin-top:.45rem;">Serviciu principal: ${escapeHtml(item.service1)} ${escapeHtml(item.price1)}</p>
      </article>
    `);

    renderList("issues-list", payload.issues, (item) => `
      <article class="list-item">
        <div class="item-top"><span class="item-title">${escapeHtml(item.title)}</span><span class="badge">${escapeHtml(item.category)}</span></div>
        <div class="item-meta">${escapeHtml(item.city)} · ${escapeHtml(item.submitted_at)}</div>
        <p class="muted" style="margin-top:.45rem;">${escapeHtml(item.description)}</p>
      </article>
    `);

    renderList("users-list", payload.users, (item) => `
      <article class="list-item">
        <div class="item-top"><span class="item-title">${escapeHtml(item.name)}</span><span class="badge">user</span></div>
        <div class="item-meta">${escapeHtml(item.email)} · ${escapeHtml(item.submitted_at)}</div>
      </article>
    `);

    renderList("logins-list", payload.logins, (item) => `
      <article class="list-item">
        <div class="item-top"><span class="item-title">Autentificare</span><span class="badge">login</span></div>
        <div class="item-meta">${escapeHtml(item.email)} · ${escapeHtml(item.submitted_at)}</div>
      </article>
    `);
  }

  document.querySelectorAll("form[data-ajax-form='true']").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      try {
        await submitAjaxForm(form);
      } catch (error) {
        showMessage(error.message, "error");
      }
    }, true);
  });

  loadDashboard().catch(() => {
    showMessage("Panoul AJAX nu a putut incarca datele.", "error");
  });
})();
