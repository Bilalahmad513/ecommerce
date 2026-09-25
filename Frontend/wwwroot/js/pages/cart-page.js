(function () {
    "use strict";

    function escapeHtml(value) {
        var div = document.createElement("div");
        div.textContent = value == null ? "" : String(value);
        return div.innerHTML;
    }

    function render() {
        var container = document.getElementById("cartContainer");
        var items = Cart.getItems();

        if (!items.length) {
            container.innerHTML =
                '<div class="empty-state card-panel">' +
                '<p class="mb-2">Your cart is empty.</p>' +
                '<a href="/">Continue shopping &rarr;</a>' +
                "</div>";
            return;
        }

        var rows = items.map(function (item) {
            return (
                "<tr>" +
                '<td class="fw-semibold">' + escapeHtml(item.name) + "</td>" +
                "<td>Rs. " + item.price.toFixed(2) + "</td>" +
                '<td style="width: 170px;">' +
                '<div class="d-flex gap-1">' +
                '<input type="number" min="0" class="form-control form-control-sm qty-input" data-product-id="' + item.productId + '" value="' + item.quantity + '" />' +
                '<button type="button" class="btn btn-sm btn-outline-secondary update-qty-btn" data-product-id="' + item.productId + '">Update</button>' +
                "</div></td>" +
                '<td class="fw-semibold">Rs. ' + (item.price * item.quantity).toFixed(2) + "</td>" +
                '<td><button type="button" class="btn btn-sm btn-outline-danger remove-btn" data-product-id="' + item.productId + '">Remove</button></td>' +
                "</tr>"
            );
        }).join("");

        container.innerHTML =
            '<div class="table-panel mb-4"><table class="table mb-0"><thead><tr>' +
            "<th>Product</th><th>Price</th><th>Quantity</th><th>Total</th><th></th>" +
            "</tr></thead><tbody>" + rows + "</tbody></table></div>" +
            '<div class="row justify-content-end"><div class="col-md-5"><div class="card-panel">' +
            '<h5 class="mb-3">Order Summary</h5>' +
            '<div class="d-flex justify-content-between fs-5 fw-bold mb-3">' +
            "<span>Grand Total</span><span>Rs. " + Cart.getGrandTotal().toFixed(2) + "</span>" +
            "</div>" +
            '<a class="btn btn-success w-100" href="/Checkout">Proceed to Checkout</a>' +
            "</div></div></div>";

        container.querySelectorAll(".update-qty-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var input = container.querySelector('.qty-input[data-product-id="' + btn.dataset.productId + '"]');
                Cart.updateQuantity(Number(btn.dataset.productId), Math.max(0, parseInt(input.value, 10) || 0));
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
