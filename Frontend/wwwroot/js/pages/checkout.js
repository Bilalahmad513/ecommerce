(function () {
    "use strict";

    function escapeHtml(value) {
        var div = document.createElement("div");
        div.textContent = value == null ? "" : String(value);
        return div.innerHTML;
    }

    function renderSummary(items) {
        document.getElementById("orderSummaryList").innerHTML = items.map(function (item) {
            return (
                '<li class="d-flex justify-content-between py-2 border-bottom">' +
                "<span>" + escapeHtml(item.name) + ' <span class="text-muted">&times; ' + item.quantity + "</span></span>" +
                '<span class="fw-semibold">Rs. ' + (item.price * item.quantity).toFixed(2) + "</span>" +
                "</li>"
            );
        }).join("");
        document.getElementById("grandTotal").textContent = "Rs. " + Cart.getGrandTotal().toFixed(2);
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (!Auth.requireAuth("/Checkout")) return;

        var items = Cart.getItems();
        if (!items.length) {
            sessionStorage.setItem("flash_error", "Your cart is empty.");
            window.location.href = "/Cart";
            return;
        }
        renderSummary(items);

        var auth = Auth.getAuth();
        document.querySelector('input[name="fullName"]').value = auth.fullName || "";
        document.getElementById("checkoutEmail").value = auth.email || "";

        var form = document.getElementById("checkoutForm");
        Api.submitJsonForm(form, {
            url: "api/orders",
            transform: function (payload) {
                payload.items = Cart.getItems().map(function (i) {
                    return { productId: i.productId, quantity: i.quantity };
                });
                return payload;
            },
            onSuccess: function (order) {
                Cart.clear();
                sessionStorage.setItem("flash_message", "Order #" + order.id + " placed successfully!");
                window.location.href = "/MyOrders";
            }
        });
    });
})();
