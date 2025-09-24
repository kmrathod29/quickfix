// technician/technician.js
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

  let autoUpdateInterval = null;
  let technicianLocation = null;
  let jobsRefreshInterval = null;
  let knownJobIds = new Set();
  let firstJobsLoadDone = false;

  function showToast(message, type = "info") {
    const containerId = "tech-toast-container";
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      container.style.position = "fixed";
      container.style.right = "20px";
      container.style.bottom = "20px";
      container.style.zIndex = "3000";
      container.style.display = "flex";
      container.style.flexDirection = "column-reverse";
      container.style.gap = "8px";
      document.body.appendChild(container);
    }
    const el = document.createElement("div");
    el.style.background =
      type === "success" ? "#16a34a" : type === "error" ? "#dc2626" : "#2563eb";
    el.style.color = "#fff";
    el.style.padding = "10px 14px";
    el.style.borderRadius = "8px";
    el.style.boxShadow = "0 8px 16px rgba(0,0,0,.2)";
    el.style.maxWidth = "320px";
    el.style.fontSize = "14px";
    el.style.animation = "fadein .2s ease";
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 4000);
  }

  async function loadSummary() {
    const res = await fetch(API_BASE + "/api/technician/summary", {
      headers: { ...authHeader() },
    });
    if (!res.ok) throw new Error("Failed to load summary");
    const s = await res.json();
    document.getElementById("sumTotal").textContent = s.total ?? "-";
    document.getElementById("sumPending").textContent = s.pending ?? "-";
    document.getElementById("sumCompleted").textContent = s.completed ?? "-";
  }

  async function loadJobs() {
    const status = document.getElementById("statusFilter").value;
    const url = new URL(API_BASE + "/api/technician/jobs");
    if (status) url.searchParams.set("status", status);
    const res = await fetch(url, { headers: { ...authHeader() } });
    if (!res.ok) throw new Error("Failed to load jobs");
    const data = await res.json();
    const tbody = document.getElementById("jobsBody");
    tbody.innerHTML = "";
    (data.items || []).forEach((b) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="p-2">${b.name || "-"}</td>
        <td class="p-2">${b.serviceType || b.serviceId?.name || "-"}</td>
        <td class="p-2">${b.date || "-"} ${b.time || ""}</td>
        <td class="p-2">${b.status}</td>
        <td class="p-2">
          <select class="border rounded px-1 py-0.5 text-xs" data-id="${b._id}">
            ${[
              "Pending",
              "Accepted",
              "En route",
              "Arrived",
              "Completed",
              "Cancelled",
            ]
              .map(
                (s) =>
                  `<option ${s === b.status ? "selected" : ""}>${s}</option>`
              )
              .join("")}
          </select>
          <button class="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded" data-save="${
            b._id
          }">Save</button>
        </td>`;
      tbody.appendChild(tr);
    });
  }

  async function saveStatus(id, status) {
    const res = await fetch(API_BASE + "/api/technician/jobs/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Failed to update");
    }
  }

  // Location management functions
  async function loadTechnicianLocation() {
    try {
      const res = await fetch(API_BASE + "/api/location/me", {
        headers: { ...authHeader() },
      });
      if (!res.ok) throw new Error("Failed to load location");
      const data = await res.json();
      technicianLocation = data;
      updateLocationDisplay(data);
    } catch (error) {
      console.error("Error loading technician location:", error);
      updateLocationDisplay(null);
    }
  }

  function updateLocationDisplay(data) {
    const statusEl = document.getElementById("locationStatus");
    const textEl = document.getElementById("locationText");
    const updatedEl = document.getElementById("locationUpdated");
    const availabilityToggle = document.getElementById("availabilityToggle");
    const radiusSlider = document.getElementById("radiusSlider");
    const radiusValue = document.getElementById("radiusValue");

    if (data && data.location && data.location.coordinates) {
      const [lng, lat] = data.location.coordinates;
      statusEl.textContent = data.isAvailable ? "Available" : "Offline";
      statusEl.className = `px-3 py-1 rounded-full text-sm font-semibold ${
        data.isAvailable
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }`;
      textEl.textContent = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;

      if (data.locationUpdatedAt) {
        const updated = new Date(data.locationUpdatedAt);
        updatedEl.textContent = `Updated: ${updated.toLocaleString()}`;
      }

      availabilityToggle.checked = data.isAvailable || false;
      radiusSlider.value = data.serviceRadius || 10;
      radiusValue.textContent = `${data.serviceRadius || 10} km`;
    } else {
      statusEl.textContent = "Unknown";
      statusEl.className =
        "px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800";
      textEl.textContent = "Location not set";
      updatedEl.textContent = "";
    }
  }

  async function updateTechnicianLocation() {
    const updateBtn = document.getElementById("updateLocationBtn");
    const originalText = updateBtn.textContent;

    try {
      updateBtn.textContent = "Getting location...";
      updateBtn.disabled = true;

      const location = await geolocationService.getCurrentLocation();

      updateBtn.textContent = "Updating...";
      await geolocationService.updateTechnicianLocation(
        location.latitude,
        location.longitude
      );

      await loadTechnicianLocation();
      alert("Location updated successfully!");
    } catch (error) {
      console.error("Error updating location:", error);
      alert("Failed to update location: " + error.message);
    } finally {
      updateBtn.textContent = originalText;
      updateBtn.disabled = false;
    }
  }

  function toggleAutoUpdate() {
    const autoBtn = document.getElementById("autoUpdateBtn");

    if (autoUpdateInterval) {
      // Stop auto update
      clearInterval(autoUpdateInterval);
      autoUpdateInterval = null;
      autoBtn.textContent = "🔄 Auto Update";
      autoBtn.classList.remove("bg-red-600", "hover:bg-red-700");
      autoBtn.classList.add("bg-green-600", "hover:bg-green-700");
    } else {
      // Start auto update
      autoUpdateInterval = setInterval(async () => {
        try {
          const location = await geolocationService.getCurrentLocation();
          await geolocationService.updateTechnicianLocation(
            location.latitude,
            location.longitude
          );
          await loadTechnicianLocation();
        } catch (error) {
          console.error("Auto update failed:", error);
        }
      }, 60000); // Update every minute

      autoBtn.textContent = "⏹️ Stop Auto";
      autoBtn.classList.remove("bg-green-600", "hover:bg-green-700");
      autoBtn.classList.add("bg-red-600", "hover:bg-red-700");
    }
  }

  async function saveAvailabilitySettings() {
    const saveBtn = document.getElementById("saveSettingsBtn");
    const availabilityToggle = document.getElementById("availabilityToggle");
    const radiusSlider = document.getElementById("radiusSlider");
    const originalText = saveBtn.textContent;

    try {
      saveBtn.textContent = "Saving...";
      saveBtn.disabled = true;

      await geolocationService.updateTechnicianAvailability(
        availabilityToggle.checked,
        parseInt(radiusSlider.value)
      );

      await loadTechnicianLocation();
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings: " + error.message);
    } finally {
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
    }
  }

  function setupLocationEventListeners() {
    // Update location button
    const updateLocationBtn = document.getElementById("updateLocationBtn");
    if (updateLocationBtn) {
      updateLocationBtn.addEventListener("click", updateTechnicianLocation);
    }

    // Auto update toggle
    const autoUpdateBtn = document.getElementById("autoUpdateBtn");
    if (autoUpdateBtn) {
      autoUpdateBtn.addEventListener("click", toggleAutoUpdate);
    }

    // Save settings button
    const saveSettingsBtn = document.getElementById("saveSettingsBtn");
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener("click", saveAvailabilitySettings);
    }

    // Radius slider update
    const radiusSlider = document.getElementById("radiusSlider");
    const radiusValue = document.getElementById("radiusValue");
    if (radiusSlider && radiusValue) {
      radiusSlider.addEventListener("input", (e) => {
        radiusValue.textContent = `${e.target.value} km`;
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!token()) {
      window.location.href = "../login.html";
      return;
    }

    // Load existing data
    loadSummary().catch(console.error);
    loadJobs().catch(console.error);
    loadTechnicianLocation().catch(console.error);

    // Setup existing event listeners
    document
      .getElementById("statusFilter")
      .addEventListener("change", loadJobs);
    document.getElementById("jobsBody").addEventListener("click", async (e) => {
      if (e.target && e.target.dataset && e.target.dataset.save) {
        const id = e.target.dataset.save;
        const select = e.target.parentElement.querySelector("select");
        const status = select.value;
        await saveStatus(id, status);
        await loadJobs();
      }
    });

    // Setup location event listeners
    setupLocationEventListeners();

    // Cleanup on page unload
    window.addEventListener("beforeunload", () => {
      if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
      }
    });
  });
})();
