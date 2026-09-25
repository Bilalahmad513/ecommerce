(function () {
    "use strict";

    function escapeHtml(value) {
        var div = document.createElement("div");
        div.textContent = value == null ? "" : String(value);
        return div.innerHTML;
    }

    function stockBucket(stock) {
        if (stock === 0) return "out";
        if (stock <= 5) return "low";
        return "in";
    }

    var allProducts = [];
    var categories = [];
    var state = { stockFilter: "all", categoryId: "", sort: "newest", search: "" };

    function applyFilters() {
        var list = allProducts.filter(function (p) {
            if (state.stockFilter !== "all" && stockBucket(p.stock) !== state.stockFilter) return false;
            if (state.categoryId && String(p.categoryId) !== state.categoryId) return false;
            if (state.search) {
                var q = state.search.toLowerCase();
                var matches = p.name.toLowerCase().includes(q) || (p.categoryName || "").toLowerCase().includes(q);
                if (!matches) return false;
            }
            return true;
        });

        list.sort(function (a, b) {
            switch (state.sort) {
                case "name": return a.name.localeCompare(b.name);
                case "price-asc": return a.price - b.price;
                case "price-desc": return b.price - a.price;
                default: return b.id - a.id; // newest
            }
        });

        return list;
    }

    function cardHtml(p) {
        var thumb = p.imageUrl
            ? '<img src="' + escapeHtml(p.imageUrl) + '" alt="' + escapeHtml(p.name) + '" />'
            : escapeHtml((p.name || "?").trim().charAt(0).toUpperCase());

        return (
            '<div class="col">' +
            '<div class="product-card-v2">' +
            '<div class="product-card-v2-thumb">' + thumb + "</div>" +
            '<div class="product-card-v2-category">' + escapeHtml(p.categoryName) + "</div>" +
            '<div class="product-card-v2-name">' + escapeHtml(p.name) + "</div>" +
            '<div class="product-card-v2-meta">' +
            "<span class=\"product-price\">Rs. " + Math.round(p.price).toLocaleString() + "</span>" +
            '<span class="stock-pill ' + (stockBucket(p.stock) === "in" ? "in-stock" : stockBucket(p.stock) === "low" ? "low-stock" : "out-of-stock") + '">' + p.stock + " in stock</span>" +
            "</div>" +
            '<div class="product-card-v2-actions">' +
            '<a class="btn btn-outline-secondary btn-sm" href="/Admin/Products/Edit/' + p.id + '">Edit</a>' +
            '<a class="btn btn-dark btn-sm" href="/Admin/Products/Delete/' + p.id + '">Delete</a>' +
            "</div></div></div>"
        );
    }

    function addTileHtml() {
        return (
            '<div class="col"><a class="add-tile" href="/Admin/Products/Create">' +
            '<span class="add-tile-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg></span>' +
            "<div class=\"fw-semibold\">Add a new product</div>" +
            '<div class="small">Name, price, stock and a photo</div>' +
            "</a></div>"
        );
    }

    function renderStats() {
        document.getElementById("statTotalProducts").textContent = allProducts.length;
        document.getElementById("statUnitsInStock").textContent = allProducts.reduce(function (sum, p) { return sum + p.stock; }, 0);
        document.getElementById("statCategories").textContent = categories.length;
        var allTab = document.getElementById("tabCountAll");
        if (allTab) allTab.textContent = allProducts.length;
    }

    function render() {
        var container = document.getElementById("productsContainer");
        var list = applyFilters();

        if (!allProducts.length) {
            container.innerHTML = '<div class="empty-state card-panel"><p class="mb-0">No products yet. Click "+ Add Product" to create your first one.</p></div>';
            return;
        }
        if (!list.length) {
            container.innerHTML = '<div class="empty-state card-panel"><p class="mb-0">No products match this filter.</p></div>';
            return;
        }

        container.innerHTML =
            '<div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">' +
            list.map(cardHtml).join("") +
            addTileHtml() +
            "</div>";
    }

    function exportCsv() {
        var list = applyFilters();
        var header = "Name,Category,Price,Stock\n";
        var rows = list.map(function (p) {
            return [p.name, p.categoryName, p.price, p.stock].map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(",");
        }).join("\n");
        var blob = new Blob([header + rows], { type: "text/csv" });
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "products.csv";
        link.click();
    }

    async function load() {
        var [productsResult, categoriesResult] = await Promise.all([
            Api.get("api/products", { auth: false }),
            Api.get("api/categories", { auth: false })
        ]);

        allProducts = productsResult.ok ? productsResult.data : [];
        categories = categoriesResult.ok ? categoriesResult.data : [];

        var categorySelect = document.getElementById("categoryFilter");
        categories.forEach(function (c) {
            var option = document.createElement("option");
            option.value = c.id;
            option.textContent = c.name;
            categorySelect.appendChild(option);
        });

        renderStats();
        render();
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (!Auth.requireRole("Admin")) return;

        document.querySelectorAll("#stockFilterTabs .filter-tab").forEach(function (btn) {
            btn.addEventListener("click", function () {
                document.querySelectorAll("#stockFilterTabs .filter-tab").forEach(function (b) { b.classList.remove("active"); });
                btn.classList.add("active");
                state.stockFilter = btn.dataset.filter;
                render();
            });
        });

        document.getElementById("categoryFilter").addEventListener("change", function (e) {
            state.categoryId = e.target.value;
            render();
        });
        document.getElementById("sortSelect").addEventListener("change", function (e) {
            state.sort = e.target.value;
            render();
        });
        var searchInput = document.getElementById("adminSearchInput");
        if (searchInput) {
            searchInput.addEventListener("input", function (e) {
                state.search = e.target.value;
                render();
            });
        }
        document.getElementById("exportBtn").addEventListener("click", exportCsv);

        load();
    });
})();
