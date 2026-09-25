(function () {
    "use strict";

    function escapeHtml(value) {
        var div = document.createElement("div");
        div.textContent = value == null ? "" : String(value);
        return div.innerHTML;
    }

    async function load() {
        var container = document.getElementById("categoriesContainer");
        var result = await Api.get("api/categories", { auth: false });
        if (!result.ok) return;

        var categories = result.data;
        if (!categories.length) {
            container.innerHTML = '<div class="empty-state card-panel"><p class="mb-0">No categories yet. Click "+ Add Category" to create your first one.</p></div>';
            return;
        }

        var rows = categories.map(function (c) {
            return (
                "<tr>" +
                '<td class="fw-semibold">' + escapeHtml(c.name) + "</td>" +
                "<td>" + escapeHtml(c.description) + "</td>" +
                "<td>" +
                '<a class="btn btn-sm btn-outline-secondary" href="/Admin/Categories/Edit/' + c.id + '">Edit</a> ' +
                '<a class="btn btn-sm btn-outline-danger" href="/Admin/Categories/Delete/' + c.id + '">Delete</a>' +
                "</td></tr>"
            );
        }).join("");

        container.innerHTML =
            '<div class="table-panel"><table class="table align-middle mb-0"><thead><tr>' +
            "<th>Name</th><th>Description</th><th></th>" +
            "</tr></thead><tbody>" + rows + "</tbody></table></div>";
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (!Auth.requireRole("Admin")) return;
        load();
    });
})();
