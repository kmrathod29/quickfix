// user/user.js
(function () {
  const API_BASE = "http://localhost:9000";
  function token() {
    try {
      return localStorage.getItem("quickfix-token");
    } catch (_) {
      return null;
    }
  }
  function authHeader() {
    const t = token();
    return t ? { Authorization: "Bearer " + t } : {};
  }

  async function loadSummary() {
    const res = await fetch(API_BASE + "/api/me/summary", {
      headers: { ...authHeader() },
    });
    if (res.status === 401) {
      try {
        localStorage.removeItem("quickfix-token");
        localStorage.removeItem("quickfix-user");
        localStorage.removeItem("quickfix-role");
      } catch (_) {}
      if (window.openRoleSelectModal) {
        window.openRoleSelectModal("login");
      } else {
        window.location.href = "../login.html";
      }
      throw new Error("Unauthorized");
    }
    if (!res.ok) throw new Error("Failed to load summary");
    const s = await res.json();
    document.getElementById("sumTotal").textContent = s.total ?? "-";
    document.getElementById("sumCompleted").textContent = s.completed ?? "-";
    document.getElementById("sumPending").textContent = s.pending ?? "-";
  }
  async function loadProfile() {
    const res = await fetch(API_BASE + "/api/me", {
      headers: { ...authHeader() },
    });
    if (res.status === 401) {
      try {
        localStorage.removeItem("quickfix-token");
        localStorage.removeItem("quickfix-user");
        localStorage.removeItem("quickfix-role");
      } catch (_) {}
    }
    if (!res.ok) throw new Error("Failed to load profile");
    const data = await res.json();
    const u = data.user || {};
    document.getElementById("name").value = u.name || "";
    document.getElementById("phone").value = u.phone || "";
    document.getElementById("address").value = u.address || "";
  }
  async function saveProfile(e) {
    e.preventDefault();
    const body = {
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      address: document.getElementById("address").value,
    };
    const res = await fetch(API_BASE + "/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.message || "Save failed");
      return;
    }
    alert("Profile updated");
  }

  async function loadBookings() {
    const res = await fetch(API_BASE + "/api/me/bookings", {
      headers: { ...authHeader() },
    });
    if (res.status === 401) {
      try {
        localStorage.removeItem("quickfix-token");
        localStorage.removeItem("quickfix-user");
        localStorage.removeItem("quickfix-role");
      } catch (_) {}
    }
    if (!res.ok) throw new Error("Failed to load bookings");
    const data = await res.json();
    const tbody = document.getElementById("myBookings");
    tbody.innerHTML = "";

    (data.items || []).forEach((b) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
      <td class="p-2">${b.serviceType || b.serviceId?.name || "-"}</td>
      <td class="p-2">${b.date || "-"} ${b.time || ""}</td>
      <td class="p-2">${b.status}</td>
      <td class="p-2">
        <button data-pay="${b._id}">Pay</button>
        <button data-review="${b._id}">Review</button>
      </td>
    `;
      tbody.appendChild(tr);
    });

    // Wire pay/review actions AFTER table rows exist
    tbody.querySelectorAll("button[data-pay]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-pay");
        try {
          const res = await fetch(API_BASE + "/api/payments/checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeader() },
            body: JSON.stringify({ bookingId: id }),
          });
          const d = await res.json();
          if (!res.ok) throw new Error(d.message || "Payment init failed");
          window.location.href = d.url;
        } catch (err) {
          alert(err.message);
        }
      });
    });

    tbody.querySelectorAll("button[data-review]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-review");
        const rating = Number(prompt("Rate 1-5:"));
        if (!rating || rating < 1 || rating > 5) return;
        const comment = prompt("Optional comment:") || "";
        try {
          const res = await fetch(API_BASE + "/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeader() },
            body: JSON.stringify({ bookingId: id, rating, comment }),
          });
          const d = await res.json();
          if (!res.ok) throw new Error(d.message || "Review failed");
          alert("Thanks for your review!");
        } catch (err) {
          alert(err.message);
        }
      });
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    const boot = () => {
      loadSummary().catch((e) => console.error(e));
      loadProfile().catch((e) => console.error(e));
      loadBookings().catch((e) => console.error(e));
      const form = document.getElementById("profileForm");
      if (form) form.addEventListener("submit", saveProfile);
    };

    if (!token()) {
      if (window.openRoleSelectModal) window.openRoleSelectModal("login");
      const wait = setInterval(() => {
        if (token()) {
          clearInterval(wait);
          boot();
        }
      }, 800);
      return;
    }
    boot();
  });
})();
