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

    function render(product) {
        var container = document.getElementById("productDetail");
        var thumb = product.imageUrl
            ? '<img src="' + escapeHtml(product.imageUrl) + '" class="img-fluid rounded-3 border" alt="' + escapeHtml(product.name) + '" style="width:100%; max-height:340px; object-fit:cover;" />'
            : '<div class="product-thumb-placeholder rounded-3" style="height:340px; font-size:3rem;">' + escapeHtml((product.name || "?").trim().charAt(0).toUpperCase()) + "</div>";

        var actionHtml = Auth.isAuthenticated()
            ? '<div class="row g-2 align-items-center">' +
              '<div class="col-auto"><label class="col-form-label">Quantity</label></div>' +
              '<div class="col-auto"><input type="number" id="qtyInput" value="1" min="1" max="' + product.stock + '" class="form-control" style="width: 90px;" /></div>' +
              '<div class="col-auto"><button type="button" id="addToCartBtn" class="btn btn-primary"' + (product.stock === 0 ? " disabled" : "") + '>Add to Cart</button></div>' +
              "</div>"
            : '<a class="btn btn-primary" href="/Account/Login">Login to Order</a>';

        container.innerHTML =
            '<div class="row g-4">' +
            '<div class="col-md-5">' + thumb + "</div>" +
            '<div class="col-md-7"><div class="card-panel h-100">' +
            '<p class="text-muted small mb-1">' + escapeHtml(product.categoryName) + "</p>" +
            "<h2 class=\"mb-2\">" + escapeHtml(product.name) + "</h2>" +
            '<p class="text-muted">' + escapeHtml(product.description) + "</p>" +
            '<div class="d-flex align-items-center gap-3 my-3">' +
            '<span class="product-price fs-3">Rs. ' + Number(product.price).toFixed(2) + "</span>" +
            '<span class="stock-pill ' + stockClass(product.stock) + '">' + stockText(product.stock) + "</span>" +
            "</div>" +
            actionHtml +
            "</div></div></div>";

        var addBtn = document.getElementById("addToCartBtn");
        if (addBtn) {
            addBtn.addEventListener("click", function () {
                var qty = Math.max(1, parseInt(document.getElementById("qtyInput").value, 10) || 1);
                Cart.addItem(product, qty);
                addBtn.textContent = "Added!";
                setTimeout(function () { addBtn.textContent = "Add to Cart"; }, 1200);
            });
        }
    }

    document.addEventListener("DOMContentLoaded", async function () {
        var id = document.getElementById("productDetail").dataset.productId;
        var result = await Api.get("api/products/" + id, { auth: false });
        if (!result.ok) {
            document.getElementById("productDetail").innerHTML = '<div class="alert alert-danger">Product not found.</div>';
            return;
        }
        render(result.data);
    });
})();
