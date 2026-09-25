(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        if (!Auth.requireRole("Admin")) return;

        var auth = Auth.getAuth();
        var avatarEl = document.getElementById("user-avatar");
        var nameEl = document.getElementById("user-name");
        if (avatarEl) avatarEl.textContent = (auth.fullName || "?").trim().charAt(0).toUpperCase() || "?";
        if (nameEl) nameEl.textContent = auth.fullName;

        var logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) logoutBtn.addEventListener("click", function () { Auth.logout(); });

        var searchInput = document.getElementById("adminSearchInput");
        if (searchInput) {
            document.addEventListener("keydown", function (e) {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                    e.preventDefault();
                    searchInput.focus();
                }
            });
        }

        var badge = document.getElementById("admin-open-orders-badge");
        if (badge) {
            Api.get("api/orders/all").then(function (result) {
                if (!result.ok) return;
                var openCount = result.data.filter(function (o) { return o.status === "Open"; }).length;
                if (openCount > 0) {
                    badge.textContent = openCount;
                    badge.classList.remove("d-none");
                }
            });
        }
    });
})();
