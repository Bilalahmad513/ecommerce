(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        var authed = document.getElementById("nav-authed-links");
        var adminSection = document.getElementById("nav-admin-section");
        var guestLinks = document.getElementById("nav-guest-links");
        var userFooter = document.getElementById("nav-user-footer");
        var logoutBtn = document.getElementById("logout-btn");

        if (Auth.isAuthenticated()) {
            var auth = Auth.getAuth();

            if (authed) authed.classList.remove("d-none");
            if (userFooter) userFooter.classList.remove("d-none");
            if (guestLinks) guestLinks.classList.add("d-none");
            if (adminSection && Auth.isAdmin()) adminSection.classList.remove("d-none");

            var avatarEl = document.getElementById("user-avatar");
            var nameEl = document.getElementById("user-name");
            if (avatarEl) avatarEl.textContent = (auth.fullName || "?").trim().charAt(0).toUpperCase() || "?";
            if (nameEl) nameEl.textContent = auth.fullName;

            var badge = document.getElementById("order-badge");
            if (badge) {
                Api.get("api/orders/unseen-count").then(function (result) {
                    if (result.ok && result.data > 0) {
                        badge.textContent = result.data;
                        badge.classList.remove("d-none");
                    }
                });
            }
        } else {
            if (guestLinks) guestLinks.classList.remove("d-none");
        }

        if (logoutBtn) {
            logoutBtn.addEventListener("click", function () { Auth.logout(); });
        }

        highlightActiveNavLink();
    });

    function highlightActiveNavLink() {
        var currentPath = window.location.pathname.replace(/\/+$/, "").toLowerCase() || "/";
        var links = document.querySelectorAll(".sidebar-nav .sidebar-link[href], .sidebar-nav .sidebar-sublink[href]");
        var bestMatch = null;

        links.forEach(function (link) {
            var linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/+$/, "").toLowerCase() || "/";
            if (currentPath === linkPath || currentPath.indexOf(linkPath + "/") === 0) {
                if (!bestMatch || linkPath.length > bestMatch.linkPath.length) {
                    bestMatch = { link: link, linkPath: linkPath };
                }
            }
        });

        if (bestMatch) {
            bestMatch.link.classList.add("active");
        }
    }
})();
