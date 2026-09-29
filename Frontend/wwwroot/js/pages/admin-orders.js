(function () {
    "use strict";

    var CHEVRON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>';

    function escapeHtml(value) {
        var div = document.createElement("div");
        div.textContent = value == null ? "" : String(value);
        return div.innerHTML;
    }

    function formatDate(iso) {
        var d = new Date(iso);
        return {
            date: d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }),
            time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
        };
    }

    function customerInitials(name) {
        var parts = (name || "?").trim().split(/\s+/);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    var STATUS_CLASS = {
        Open: "status-open",
        Accepted: "status-accepted",
        Preparation: "status-preparation",
        OnDelivery: "status-ondelivery",
        Delivered: "status-delivered",
        Cancelled: "status-cancelled"
    };

    function statusLabel(status) {
        return status === "OnDelivery" ? "On Delivery" : status;
    }

    function statusOptions(order) {
        var opts = [];
        if (order.status === "Open") opts.push({ value: "Open", label: "Open" });
        ["Accepted", "Preparation", "OnDelivery"].forEach(function (s) {
            opts.push({ value: s, label: statusLabel(s) });
        });
        opts.push({ value: "Cancelled", label: "Cancel Order" });
        return opts;
    }

    function statusCellHtml(order) {
        if (order.status === "Delivered") {
            return '<span class="order-status-pill status-delivered">Delivered</span>';
        }
        if (order.status === "Cancelled") {
            return '<span class="order-status-pill status-cancelled">Cancelled</span>';
        }

        return (
            '<div class="status-dropdown">' +
            '<button type="button" class="order-status-select-wrap status-dropdown-toggle ' + STATUS_CLASS[order.status] + '" data-order-id="' + order.id + '" aria-expanded="false">' +
            "<span>" + statusLabel(order.status) + "</span>" + CHEVRON_SVG +
            "</button></div>"
        );
    }

    function rowHtml(order) {
        var when = formatDate(order.orderDate);
        var totalQty = order.items.reduce(function (sum, i) { return sum + i.quantity; }, 0);
        var itemsLabel = escapeHtml(order.items[0].productName) + (order.items.length > 1 ? " +" + (order.items.length - 1) + " more" : "");

        return (
            "<tr>" +
            '<td><div class="order-id">#' + order.id + "</div><div class=\"order-date\">" + when.date + "<br />" + when.time + "</div></td>" +
            '<td><div class="order-customer-cell">' +
            '<span class="order-avatar">' + escapeHtml(customerInitials(order.customerName)) + "</span>" +
            '<div><div class="order-customer-name">' + escapeHtml(order.customerName) + "</div>" +
            '<div class="order-customer-sub">' + escapeHtml(order.customerEmail) + "<br />" + escapeHtml(order.customerPhone) + "</div></div>" +
            "</div></td>" +
            "<td><small>" + escapeHtml(order.shippingAddress) + "</small></td>" +
            '<td><div class="order-item-name">' + itemsLabel + '</div><div class="order-item-qty">Qty: ' + totalQty + "</div></td>" +
            '<td class="fw-semibold">Rs. ' + Number(order.totalAmount).toFixed(2) + "</td>" +
            '<td><span class="payment-pill">' + escapeHtml(order.paymentMethod) + "</span></td>" +
            '<td style="width: 190px;">' + statusCellHtml(order) + "</td>" +
            "</tr>"
        );
    }

    var allOrders = [];
    var search = "";
    var statusFilter = "all";

    function applyFilters() {
        return allOrders.filter(function (o) {
            if (statusFilter !== "all" && o.status !== statusFilter) return false;
            if (search) {
                var q = search.toLowerCase();
                var matches = String(o.id).indexOf(q) !== -1 ||
                    (o.customerName || "").toLowerCase().indexOf(q) !== -1 ||
                    (o.customerEmail || "").toLowerCase().indexOf(q) !== -1;
                if (!matches) return false;
            }
            return true;
        });
    }

    function renderStats() {
        document.getElementById("statTotalOrders").textContent = allOrders.length;
        document.getElementById("statOpenOrders").textContent = allOrders.filter(function (o) { return o.status === "Open"; }).length;
        document.getElementById("statAcceptedOrders").textContent = allOrders.filter(function (o) { return o.status === "Accepted"; }).length;
        document.getElementById("statDeliveredOrders").textContent = allOrders.filter(function (o) { return o.status === "Delivered"; }).length;
        var allTab = document.getElementById("tabCountAll");
        if (allTab) allTab.textContent = allOrders.length;
    }

    function render() {
        var container = document.getElementById("ordersContainer");
        var note = document.getElementById("ordersShowingNote");

        if (!allOrders.length) {
            container.innerHTML = '<div class="empty-state card-panel"><p class="mb-0">No orders yet.</p></div>';
            if (note) note.textContent = "";
            return;
        }

        var orders = applyFilters();
        if (note) note.textContent = "Showing " + orders.length + " order" + (orders.length === 1 ? "" : "s");

        if (!orders.length) {
            container.innerHTML = '<div class="empty-state card-panel"><p class="mb-0">No orders match this filter.</p></div>';
            return;
        }

        container.innerHTML =
            '<div class="table-panel"><table class="table align-middle mb-0"><thead><tr>' +
            "<th>Order</th><th>Customer</th><th>Shipping</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th>" +
            "</tr></thead><tbody>" + orders.map(rowHtml).join("") + "</tbody></table></div>";

        container.querySelectorAll(".status-dropdown-toggle").forEach(function (btn) {
            btn.addEventListener("click", function (e) {
                e.stopPropagation();
                var orderId = Number(btn.dataset.orderId);
                var order = allOrders.find(function (o) { return o.id === orderId; });
                if (order) toggleStatusMenu(btn, order);
            });
        });
    }

    var openMenuEl = null;
    var openMenuToggle = null;

    function closeStatusMenu() {
        if (openMenuEl) openMenuEl.remove();
        if (openMenuToggle) openMenuToggle.setAttribute("aria-expanded", "false");
        openMenuEl = null;
        openMenuToggle = null;
    }

    async function chooseStatus(order, value) {
        closeStatusMenu();
        if (value === order.status) return;
        var result = await Api.put("api/orders/" + order.id + "/status", { status: value });
        if (!result.ok) { alert(result.error); }
        load();
    }

    function toggleStatusMenu(btn, order) {
        if (openMenuToggle === btn) {
            closeStatusMenu();
            return;
        }
        closeStatusMenu();

        var menu = document.createElement("div");
        menu.className = "status-dropdown-menu";
        statusOptions(order).forEach(function (opt) {
            var item = document.createElement("button");
            item.type = "button";
            item.className = "status-dropdown-item" + (opt.value === order.status ? " is-current" : "");
            item.innerHTML = '<span class="status-dot-inline dot-' + opt.value.toLowerCase() + '"></span><span>' + opt.label + "</span>";
            item.addEventListener("click", function (e) {
                e.stopPropagation();
                chooseStatus(order, opt.value);
            });
            menu.appendChild(item);
        });

        document.body.appendChild(menu);
        var rect = btn.getBoundingClientRect();
        var menuRect = menu.getBoundingClientRect();
        var left = rect.left;
        if (left + menuRect.width > window.innerWidth - 8) left = window.innerWidth - menuRect.width - 8;
        menu.style.top = (rect.bottom + 6) + "px";
        menu.style.left = Math.max(8, left) + "px";

        btn.setAttribute("aria-expanded", "true");
        openMenuEl = menu;
        openMenuToggle = btn;
    }

    function exportCsv() {
        var orders = applyFilters();
        var header = "Order,Customer,Email,Total,Payment,Status\n";
        var rows = orders.map(function (o) {
            return [o.id, o.customerName, o.customerEmail, o.totalAmount, o.paymentMethod, o.status]
                .map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(",");
        }).join("\n");
        var blob = new Blob([header + rows], { type: "text/csv" });
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "orders.csv";
        link.click();
    }

    async function load() {
        var result = await Api.get("api/orders/all");
        if (!result.ok) return;
        allOrders = result.data;
        renderStats();
        render();
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (!Auth.requireRole("Admin")) return;

        document.querySelectorAll("#statusFilterTabs .filter-tab").forEach(function (btn) {
            btn.addEventListener("click", function () {
                document.querySelectorAll("#statusFilterTabs .filter-tab").forEach(function (b) { b.classList.remove("active"); });
                btn.classList.add("active");
                statusFilter = btn.dataset.filter;
                render();
            });
        });

        var searchInput = document.getElementById("adminSearchInput");
        if (searchInput) {
            searchInput.placeholder = "Search by order #, name or email...";
            searchInput.addEventListener("input", function (e) {
                search = e.target.value;
                render();
            });
        }

        document.getElementById("exportBtn").addEventListener("click", exportCsv);

        document.addEventListener("click", closeStatusMenu);
        window.addEventListener("scroll", closeStatusMenu, true);
        window.addEventListener("resize", closeStatusMenu);

        load();
    });
})();
