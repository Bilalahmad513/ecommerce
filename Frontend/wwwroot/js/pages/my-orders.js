(function () {
    "use strict";

    function escapeHtml(value) {
        var div = document.createElement("div");
        div.textContent = value == null ? "" : String(value);
        return div.innerHTML;
    }

    var BADGE_CLASS = {
        Open: "bg-secondary",
        Accepted: "bg-info text-dark",
        Preparation: "bg-warning text-dark",
        OnDelivery: "bg-primary",
        Delivered: "bg-success",
        Cancelled: "bg-danger"
    };

    var LABEL = { OnDelivery: "On Delivery" };

    function formatDate(iso) {
        var d = new Date(iso);
        return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) +
            ", " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    }

    function rowHtml(order) {
        var itemsHtml = order.items.map(function (i) {
            return "<li>" + escapeHtml(i.productName) + " &times; " + i.quantity + "</li>";
        }).join("");

        var actionHtml = order.status === "OnDelivery"
            ? '<select class="form-select form-select-sm confirm-delivery-select" data-order-id="' + order.id + '">' +
              '<option value="" selected disabled>On Delivery</option>' +
              '<option value="received">Order Received</option>' +
              "</select>"
            : "";

        return (
            "<tr>" +
            '<td class="fw-semibold">#' + order.id + "</td>" +
            "<td>" + formatDate(order.orderDate) + "</td>" +
            '<td><ul class="list-unstyled mb-0">' + itemsHtml + "</ul></td>" +
            '<td class="fw-semibold">Rs. ' + Number(order.totalAmount).toFixed(2) + "</td>" +
            '<td><span class="badge ' + (BADGE_CLASS[order.status] || "bg-secondary") + '">' + (LABEL[order.status] || order.status) + "</span></td>" +
            '<td style="width: 160px;">' + actionHtml + "</td>" +
            "</tr>"
        );
    }

    async function load() {
        var container = document.getElementById("ordersContainer");
        var result = await Api.get("api/orders");
        if (!result.ok) return;

        var orders = result.data;
        if (!orders.length) {
            container.innerHTML =
                '<div class="empty-state card-panel"><p class="mb-2">You haven\'t placed any orders yet.</p>' +
                '<a href="/">Start shopping &rarr;</a></div>';
            return;
        }

        container.innerHTML =
            '<div class="table-panel"><table class="table mb-0"><thead><tr>' +
            "<th>#</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th></th>" +
            "</tr></thead><tbody>" + orders.map(rowHtml).join("") + "</tbody></table></div>";

        container.querySelectorAll(".confirm-delivery-select").forEach(function (select) {
            select.addEventListener("change", async function () {
                if (select.value !== "received") return;
                var result = await Api.post("api/orders/" + select.dataset.orderId + "/confirm-delivery");
                if (!result.ok) { alert(result.error); return; }
                load();
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (!Auth.requireAuth("/MyOrders")) return;
        load();
    });
})();
