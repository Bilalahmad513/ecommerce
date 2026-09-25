(function () {
    "use strict";

    function escapeHtml(value) {
        var div = document.createElement("div");
        div.textContent = value == null ? "" : String(value);
        return div.innerHTML;
    }

    document.addEventListener("DOMContentLoaded", async function () {
        if (!Auth.requireRole("Admin")) return;

        var panel = document.getElementById("deleteCategoryPanel");
        var id = panel.dataset.categoryId;

        var result = await Api.get("api/categories/" + id, { auth: false });
        if (result.ok) {
            var c = result.data;
            var prompt = "Are you sure you want to delete <strong>" + escapeHtml(c.name) + "</strong>?";
            if (c.description) prompt += '<p class="text-muted mt-2 mb-0">' + escapeHtml(c.description) + "</p>";
            document.getElementById("deleteCategoryPrompt").innerHTML = prompt;
        }

        document.getElementById("confirmDeleteBtn").addEventListener("click", async function () {
            var delResult = await Api.delete("api/categories/" + id);
            if (!delResult.ok) {
                var errorEl = document.querySelector("[data-form-error]");
                errorEl.textContent = delResult.error;
                errorEl.classList.remove("d-none");
                return;
            }
            window.location.href = "/Admin/Categories";
        });
    });
})();
