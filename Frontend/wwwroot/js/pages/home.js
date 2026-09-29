(function () {
    "use strict";

    function escapeHtml(value) {
        var div = document.createElement("div");
        div.textContent = value == null ? "" : String(value);
        return div.innerHTML;
    }

    function stockClass(stock) {
        if (stock === 0) return "out-of-stock";
        if (stock <= 5) return "low-stock";
        return "in-stock";
    }

    function stockText(stock) {
        if (stock === 0) return "Out of stock";
        if (stock <= 5) return "Only " + stock + " left";
        return stock + " in stock";
    }

    var CART_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>';

    function productCardHtml(product, authed) {
        var thumb = product.imageUrl
            ? '<img src="' + escapeHtml(product.imageUrl) + '" alt="' + escapeHtml(product.name) + '" />'
            : escapeHtml((product.name || "?").trim().charAt(0).toUpperCase());

        var actionHtml = authed
            ? '<button type="button" class="btn btn-primary btn-sm add-to-cart-btn d-flex align-items-center justify-content-center gap-1" data-product-id="' + product.id + '"' + (product.stock === 0 ? " disabled" : "") + ">" + CART_ICON_SVG + "<span>Add to Cart</span></button>"
            : '<a class="btn btn-primary btn-sm" href="/Account/Login">Login to Order</a>';

        return (
            '<div class="col">' +
            '<div class="product-card-v2">' +
            '<div class="product-card-v2-thumb">' + thumb + "</div>" +
            '<div class="product-card-v2-category">' + escapeHtml(product.categoryName) + "</div>" +
            '<div class="product-card-v2-name">' + escapeHtml(product.name) + "</div>" +
            '<div class="product-card-v2-meta">' +
            '<span class="product-price">Rs. ' + Number(product.price).toFixed(2) + "</span>" +
            '<span class="stock-pill ' + stockClass(product.stock) + '">' + stockText(product.stock) + "</span>" +
            "</div>" +
            '<div class="product-card-v2-actions">' +
            '<a class="btn btn-outline-secondary btn-sm" href="/Product/Details/' + product.id + '">Details</a>' +
            actionHtml +
            "</div></div></div>"
        );
    }

    function render(products, authed) {
        var grid = document.getElementById("productGrid");
        if (!products.length) {
            grid.innerHTML = '<div class="empty-state card-panel"><p class="mb-0">No products available yet.</p></div>';
            return;
        }
        grid.innerHTML =
            '<div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">' +
            products.map(function (p) { return productCardHtml(p, authed); }).join("") +
            "</div>";

        grid.querySelectorAll(".add-to-cart-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var product = products.find(function (p) { return p.id === Number(btn.dataset.productId); });
                Cart.addItem(product, 1);
                btn.textContent = "Added!";
                setTimeout(function () { btn.textContent = "Add to Cart"; }, 1200);
            });
        });
    }

    async function loadProducts(categoryId) {
        var path = "api/products" + (categoryId ? "?categoryId=" + encodeURIComponent(categoryId) : "");
        var result = await Api.get(path, { auth: false });
        render(result.ok ? result.data : [], Auth.isAuthenticated());
    }

    async function loadCategories() {
        var select = document.getElementById("categoryFilter");
        var result = await Api.get("api/categories", { auth: false });
        if (!result.ok) return;
        result.data.forEach(function (c) {
            var option = document.createElement("option");
            option.value = c.id;
            option.textContent = c.name;
            select.appendChild(option);
        });
        select.addEventListener("change", function () { loadProducts(select.value); });
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (Auth.isAdmin()) {
            var addLink = document.getElementById("addProductLink");
            if (addLink) addLink.classList.remove("d-none");
        }
        loadCategories();
        loadProducts();
    });
})();
