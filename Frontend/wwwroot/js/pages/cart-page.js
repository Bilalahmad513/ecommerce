(function () {
    "use strict";

    function escapeHtml(value) {
        var div = document.createElement("div");
        div.textContent = value == null ? "" : String(value);
        return div.innerHTML;
    }

    function stockBadgeHtml(stock) {
        if (stock === null || stock === undefined) return "";
        var cls = stock === 0 ? "out-of-stock" : stock <= 5 ? "low-stock" : "in-stock";
        var text = stock === 0 ? "Out of stock" : stock <= 5 ? "Only " + stock + " left" : "In stock";
        return '<span class="stock-pill ' + cls + '">' + text + "</span>";
    }

    function headerHtml(itemCount) {
        return (
            '<div class="cart-breadcrumb"><a href="/">Home</a> / Cart</div>' +
            '<div class="cart-header-row">' +
            '<h2 class="cart-title">Your Cart <span class="cart-item-count">(' + itemCount + " item" + (itemCount === 1 ? "" : "s") + ")</span></h2>" +
            '<div class="cart-steps">' +
            '<span class="cart-step active"><span class="cart-step-num">1</span>Cart</span>' +
            '<span class="cart-step-line"></span>' +
            '<span class="cart-step"><span class="cart-step-num">2</span>Shipping</span>' +
            '<span class="cart-step-line"></span>' +
            '<span class="cart-step"><span class="cart-step-num">3</span>Payment</span>' +
            "</div></div>"
        );
    }

    function rowHtml(item) {
        var thumb = item.imageUrl
            ? '<img src="' + escapeHtml(item.imageUrl) + '" alt="' + escapeHtml(item.name) + '" />'
            : escapeHtml((item.name || "?").trim().charAt(0).toUpperCase());

        return (
            "<tr>" +
            "<td>" +
            '<div class="cart-item-cell">' +
            '<div class="cart-item-thumb">' + thumb + "</div>" +
            "<div>" +
            '<div class="cart-item-name">' + escapeHtml(item.name) + "</div>" +
            stockBadgeHtml(item.stock) +
            '<div><button type="button" class="cart-remove-link remove-btn" data-product-id="' + item.productId + '">Remove</button></div>' +
            "</div></div></td>" +
            "<td>Rs. " + item.price.toFixed(2) + "</td>" +
            '<td style="width: 120px;">' +
            '<div class="qty-stepper">' +
            '<button type="button" class="qty-dec-btn" data-product-id="' + item.productId + '">&minus;</button>' +
            '<span class="qty-stepper-value">' + item.quantity + "</span>" +
            '<button type="button" class="qty-inc-btn" data-product-id="' + item.productId + '">+</button>' +
            "</div></td>" +
            '<td class="fw-semibold">Rs. ' + (item.price * item.quantity).toFixed(2) + "</td>" +
            "</tr>"
        );
    }

    function render() {
        var container = document.getElementById("cartContainer");
        var items = Cart.getItems();

        if (!items.length) {
            container.innerHTML =
                headerHtml(0) +
                '<div class="empty-state card-panel">' +
                '<p class="mb-2">Your cart is empty.</p>' +
                '<a href="/">Continue shopping &rarr;</a>' +
                "</div>";
            return;
        }

        var itemCount = items.reduce(function (sum, i) { return sum + i.quantity; }, 0);
        var rows = items.map(rowHtml).join("");
        var grandTotal = Cart.getGrandTotal();

        container.innerHTML =
            headerHtml(itemCount) +
            '<div class="row g-4">' +
            '<div class="col-lg-8">' +
            '<div class="table-panel mb-3"><table class="table align-middle mb-0"><thead><tr>' +
            "<th>Product</th><th>Price</th><th>Quantity</th><th>Total</th>" +
            "</tr></thead><tbody>" + rows + "</tbody></table></div>" +
            '<div class="d-flex justify-content-between align-items-center flex-wrap gap-2">' +
            '<a class="cart-continue-link" href="/">&larr; Continue shopping</a>' +
            '<span class="cart-tax-note">Prices include all taxes</span>' +
            "</div></div>" +
            '<div class="col-lg-4">' +
            '<div class="card-panel">' +
            '<h5 class="mb-3">Order Summary</h5>' +
            '<div class="d-flex justify-content-between text-muted mb-2">' +
            "<span>Subtotal (" + itemCount + " item" + (itemCount === 1 ? "" : "s") + ")</span>" +
            "<span>Rs. " + grandTotal.toFixed(2) + "</span>" +
            "</div>" +
            "<hr />" +
            '<div class="d-flex justify-content-between fs-5 fw-bold mb-3">' +
            "<span>Grand Total</span><span>Rs. " + grandTotal.toFixed(2) + "</span>" +
            "</div>" +
            '<a class="btn btn-primary w-100 mb-3" href="/Checkout">Proceed to Checkout</a>' +
            '<div class="d-flex gap-2 flex-wrap">' +
            '<span class="payment-pill">Visa</span><span class="payment-pill">Mastercard</span>' +
            '<span class="payment-pill">JazzCash</span><span class="payment-pill">Easypaisa</span>' +
            '<span class="payment-pill">COD</span>' +
            "</div></div></div></div>";

        container.querySelectorAll(".qty-dec-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var item = items.find(function (i) { return i.productId === Number(btn.dataset.productId); });
                Cart.updateQuantity(item.productId, item.quantity - 1);
                render();
            });
        });
        container.querySelectorAll(".qty-inc-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var item = items.find(function (i) { return i.productId === Number(btn.dataset.productId); });
                Cart.updateQuantity(item.productId, item.quantity + 1);
                render();
            });
        });
        container.querySelectorAll(".remove-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                Cart.removeItem(Number(btn.dataset.productId));
                render();
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (!Auth.requireAuth("/Cart")) return;
        render();
    });
})();
