(function () {
    "use strict";

    function baseUrl() {
        var meta = document.querySelector('meta[name="backend-base-url"]');
        return meta ? meta.content.replace(/\/$/, "") : "";
    }

    function parseError(data, status) {
        if (typeof data === "string" && data) return data;
        if (data && typeof data === "object") {
            if (data.errors) {
                var messages = [];
                Object.keys(data.errors).forEach(function (key) {
                    (data.errors[key] || []).forEach(function (m) { messages.push(m); });
                });
                if (messages.length) return messages.join(" ");
            }
            if (data.title) return data.title;
        }
        return "Request failed (" + status + ").";
    }

    async function request(path, options) {
        options = options || {};
        var headers = { Accept: "application/json" };
        var body = options.body;

        if (body !== undefined && body !== null) {
            headers["Content-Type"] = "application/json";
            body = JSON.stringify(body);
        }

        if (options.auth !== false && window.Auth && window.Auth.getToken()) {
            headers["Authorization"] = "Bearer " + window.Auth.getToken();
        }

        var url = baseUrl() + "/" + path.replace(/^\//, "");
        var res = await fetch(url, {
            method: options.method || "GET",
            headers: headers,
            body: body
        });

        var data = null;
        var text = await res.text();
        if (text) {
            try { data = JSON.parse(text); } catch (e) { data = text; }
        }

        if (!res.ok) {
            return { ok: false, status: res.status, data: data, error: parseError(data, res.status) };
        }
        return { ok: true, status: res.status, data: data };
    }

    var Api = {
        get: function (path, options) { return request(path, Object.assign({ method: "GET" }, options)); },
        post: function (path, body, options) { return request(path, Object.assign({ method: "POST", body: body }, options)); },
        put: function (path, body, options) { return request(path, Object.assign({ method: "PUT", body: body }, options)); },
        delete: function (path, options) { return request(path, Object.assign({ method: "DELETE" }, options)); },
        parseError: parseError,

        // Serializes a <form>'s named fields into a plain object. Optionally
        // reshapes it (transform) before sending, since a couple of forms
        // build a nested payload the flat form fields don't directly mirror
        // (e.g. checkout attaching the cart's line items).
        submitJsonForm: function (formEl, opts) {
            formEl.addEventListener("submit", async function (e) {
                e.preventDefault();
                if (!formEl.reportValidity()) return;

                var errorEl = opts.errorEl || formEl.querySelector("[data-form-error]");
                if (errorEl) { errorEl.textContent = ""; errorEl.classList.add("d-none"); }

                var payload = {};
                new FormData(formEl).forEach(function (value, key) { payload[key] = value; });
                if (opts.transform) payload = opts.transform(payload, formEl);

                var submitBtn = formEl.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.disabled = true;

                var result = await request(opts.url, { method: opts.method || "POST", body: payload });

                if (submitBtn) submitBtn.disabled = false;

                if (!result.ok) {
                    if (errorEl) {
                        errorEl.textContent = result.error;
                        errorEl.classList.remove("d-none");
                    }
                    return;
                }

                if (opts.onSuccess) opts.onSuccess(result.data);
            });
        }
    };

    window.Api = Api;
})();
