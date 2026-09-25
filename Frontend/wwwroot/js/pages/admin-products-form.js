(function () {
    "use strict";

    async function loadCategoryOptions(selectedId) {
        var select = document.getElementById("categorySelect");
        var result = await Api.get("api/categories", { auth: false });
        if (!result.ok) return;
        result.data.forEach(function (c) {
            var option = document.createElement("option");
            option.value = c.id;
            option.textContent = c.name;
            if (selectedId && Number(selectedId) === c.id) option.selected = true;
            select.appendChild(option);
        });
    }

    document.addEventListener("DOMContentLoaded", async function () {
        if (!Auth.requireRole("Admin")) return;

        var form = document.getElementById("productForm");
        var productId = form.dataset.productId;
        var isEdit = !!productId;

        if (isEdit) {
            var result = await Api.get("api/products/" + productId, { auth: false });
            if (result.ok) {
                var p = result.data;
                form.querySelector('[name="name"]').value = p.name;
                form.querySelector('[name="description"]').value = p.description || "";
                form.querySelector('[name="price"]').value = p.price;
                form.querySelector('[name="stock"]').value = p.stock;
                form.querySelector('[name="imageUrl"]').value = p.imageUrl || "";
            }
            await loadCategoryOptions(result.ok ? result.data.categoryId : null);
        } else {
            await loadCategoryOptions(null);
        }

        Api.submitJsonForm(form, {
            url: isEdit ? "api/products/" + productId : "api/products",
            method: isEdit ? "PUT" : "POST",
            transform: function (payload) {
                payload.price = parseFloat(payload.price);
                payload.stock = parseInt(payload.stock, 10);
                payload.categoryId = parseInt(payload.categoryId, 10);
                return payload;
            },
            onSuccess: function () {
                window.location.href = "/Admin/Products";
            }
        });
    });
})();
