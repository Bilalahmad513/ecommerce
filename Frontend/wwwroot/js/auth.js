(function () {
    "use strict";

    var STORAGE_KEY = "ecomm_auth";

    function getAuth() {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        try { return JSON.parse(raw); } catch (e) { return null; }
    }

    function saveAuth(authResult) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authResult));
    }

    function clearAuth() {
        localStorage.removeItem(STORAGE_KEY);
    }

    function decodeJwtExpiry(token) {
        try {
            var payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
            return payload.exp ? payload.exp * 1000 : null;
        } catch (e) {
            return null;
        }
    }

    function isAuthenticated() {
        var auth = getAuth();
        if (!auth || !auth.token) return false;
        var expiresAt = decodeJwtExpiry(auth.token);
        if (expiresAt && expiresAt < Date.now()) {
            clearAuth();
            return false;
        }
        return true;
    }

    function getRoles() {
        var auth = getAuth();
        return (auth && auth.roles) || [];
    }

    function isAdmin() {
        return getRoles().indexOf("Admin") !== -1;
    }

    function getToken() {
        var auth = getAuth();
        return auth ? auth.token : null;
    }

    function logout() {
        clearAuth();
        window.location.href = "/";
    }

    // Redirect guards used at the top of a protected page's script, before
    // it fires any fetches. Return value tells the caller whether to bail.
    function requireAuth(returnUrl) {
        if (isAuthenticated()) return true;
        var target = "/Account/Login";
        if (returnUrl) target += "?returnUrl=" + encodeURIComponent(returnUrl);
        window.location.href = target;
        return false;
    }

    function requireRole(role) {
        if (!requireAuth()) return false;
        if (getRoles().indexOf(role) !== -1) return true;
        window.location.href = "/Account/AccessDenied";
        return false;
    }

    window.Auth = {
        getAuth: getAuth,
        saveAuth: saveAuth,
        clearAuth: clearAuth,
        isAuthenticated: isAuthenticated,
        getRoles: getRoles,
        isAdmin: isAdmin,
        getToken: getToken,
        logout: logout,
        requireAuth: requireAuth,
        requireRole: requireRole
    };
})();
