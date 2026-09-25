(function () {
    "use strict";

    function escapeHtml(value) {
        var div = document.createElement("div");
        div.textContent = value == null ? "" : String(value);
        return div.innerHTML;
    }

    document.addEventListener("DOMContentLoaded", async function () {
        if (!Auth.requireRole("Admin")) return;

        var panel = document.getElementById("deleteProductPanel");
        var id = panel.dataset.productId;

        var result = await Api.get("api/products/" + id, { auth: false });
        if (!result.ok) return;

        var p = result.data;
        document.getElementById("deleteProductPrompt").innerHTML = "Are you sure you want to delete <strong>" + escapeHtml(p.name) + "</strong>?";
        document.getElementById("deleteProductDetails").innerHTML =
            '<dt class="col-sm-4">Category</dt><dd class="col-sm-8">' + escapeHtml(p.categoryName) + "</dd>" +
            '<dt class="col-sm-4">Price</dt><dd class="col-sm-8">Rs. ' + Number(p.price).toFixed(2) + "</dd>" +
            '<dt class="col-sm-4">Stock</dt><dd class="col-sm-8">' + p.stock + "</dd>";

        document.getElementById("confirmDeleteBtn").addEventListener("click", async function () {
            var delResult = await Api.delete("api/products/" + id);
            if (!delResult.ok) {
                var errorEl = document.querySelector("[data-form-error]");
                errorEl.textContent = delResult.error;
                errorEl.classList.remove("d-none");
                return;
            }
            window.location.href = "/Admin/Products";
        });
    });
})();
