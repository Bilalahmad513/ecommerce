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

    function productCardHtml(product, authed) {
        var thumb = product.imageUrl
            ? '<img src="' + escapeHtml(product.imageUrl) + '" class="product-thumb" alt="' + escapeHtml(product.name) + '" />'
            : '<div class="product-thumb-placeholder">' + escapeHtml((product.name || "?").trim().charAt(0).toUpperCase()) + "</div>";

        var actionHtml = authed
            ? '<button type="button" class="btn btn-primary btn-sm w-100 add-to-cart-btn" data-product-id="' + product.id + '"' + (product.stock === 0 ? " disabled" : "") + '>Add to Cart</button>'
            : '<a class="btn btn-primary btn-sm flex-grow-1" href="/Account/Login">Login to Order</a>';

        return (
            '<div class="col">' +
            '<div class="product-card h-100 d-flex flex-column">' +
            thumb +
            '<div class="card-body d-flex flex-column flex-grow-1">' +
            '<p class="text-muted small mb-1">' + escapeHtml(product.categoryName) + "</p>" +
            "<h5 class=\"mb-2\">" + escapeHtml(product.name) + "</h5>" +
            '<div class="d-flex justify-content-between align-items-center mb-2">' +
            '<span class="product-price">Rs. ' + Number(product.price).toFixed(2) + "</span>" +
            '<span class="stock-pill ' + stockClass(product.stock) + '">' + stockText(product.stock) + "</span>" +
            "</div>" +
            '<div class="mt-auto d-flex gap-2">' +
            '<a class="btn btn-outline-primary btn-sm flex-grow-1" href="/Product/Details/' + product.id + '">Details</a>' +
            actionHtml +
            "</div></div></div></div>"
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
