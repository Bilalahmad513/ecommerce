(function () {
    "use strict";

    function escapeHtml(value) {
        var div = document.createElement("div");
        div.textContent = value == null ? "" : String(value);
        return div.innerHTML;
    }

    function formatDate(iso) {
        var d = new Date(iso);
        return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) +
            ", " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    }

    function statusCellHtml(order) {
        if (order.status === "Delivered") return '<span class="badge bg-success">Delivered</span>';
        if (order.status === "Cancelled") return '<span class="badge bg-danger">Cancelled</span>';

        var options = "";
        if (order.status === "Open") options += '<option value="Open" selected>Open</option>';
        ["Accepted", "Preparation", "OnDelivery"].forEach(function (s) {
            var label = s === "OnDelivery" ? "On Delivery" : s;
            options += '<option value="' + s + '"' + (order.status === s ? " selected" : "") + ">" + label + "</option>";
        });
        options += '<option value="Cancelled">Cancel Order</option>';

        return '<select class="form-select form-select-sm status-select" data-order-id="' + order.id + '">' + options + "</select>";
    }

    function rowHtml(order) {
        var itemsHtml = order.items.map(function (i) {
            return "<li>" + escapeHtml(i.productName) + " &times; " + i.quantity + "</li>";
        }).join("");

        return (
            "<tr>" +
            '<td class="fw-semibold">#' + order.id + "</td>" +
            "<td>" + escapeHtml(order.customerName) + "<br /><small class=\"text-muted\">" + escapeHtml(order.customerEmail) + "</small><br /><small class=\"text-muted\">" + escapeHtml(order.customerPhone) + "</small></td>" +
            "<td><small>" + escapeHtml(order.shippingAddress) + "</small></td>" +
            "<td>" + formatDate(order.orderDate) + "</td>" +
            '<td><ul class="list-unstyled mb-0">' + itemsHtml + "</ul></td>" +
            '<td class="fw-semibold">Rs. ' + Number(order.totalAmount).toFixed(2) + "</td>" +
            '<td><span class="badge bg-secondary">' + escapeHtml(order.paymentMethod) + "</span></td>" +
            '<td style="width: 200px;">' + statusCellHtml(order) + "</td>" +
            "</tr>"
        );
    }

    async function load() {
        var container = document.getElementById("ordersContainer");
        var result = await Api.get("api/orders/all");
        if (!result.ok) return;

        var orders = result.data;
        if (!orders.length) {
            container.innerHTML = '<div class="empty-state card-panel"><p class="mb-0">No orders yet.</p></div>';
            return;
        }

        container.innerHTML =
            '<div class="table-panel"><table class="table align-middle mb-0"><thead><tr>' +
            "<th>#</th><th>Customer</th><th>Shipping</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th>" +
            "</tr></thead><tbody>" + orders.map(rowHtml).join("") + "</tbody></table></div>";

        container.querySelectorAll(".status-select").forEach(function (select) {
            select.addEventListener("change", async function () {
                var result = await Api.put("api/orders/" + select.dataset.orderId + "/status", { status: select.value });
                if (!result.ok) { alert(result.error); }
                load();
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (!Auth.requireRole("Admin")) return;
        load();
    });
})();
