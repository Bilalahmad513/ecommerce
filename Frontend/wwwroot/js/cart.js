(function () {
    "use strict";

    var STORAGE_KEY = "ecomm_cart";

    function getItems() {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        try { return JSON.parse(raw) || []; } catch (e) { return []; }
    }

    function saveItems(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    function addItem(product, quantity) {
        var items = getItems();
        var existing = items.find(function (i) { return i.productId === product.id; });
        if (existing) {
            existing.quantity += quantity;
        } else {
            items.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                imageUrl: product.imageUrl || null,
                stock: typeof product.stock === "number" ? product.stock : null
            });
        }
        saveItems(items);
    }

    function updateQuantity(productId, quantity) {
        var items = getItems();
        if (quantity <= 0) {
            items = items.filter(function (i) { return i.productId !== productId; });
        } else {
            var item = items.find(function (i) { return i.productId === productId; });
            if (item) item.quantity = quantity;
        }
        saveItems(items);
    }

    function removeItem(productId) {
        saveItems(getItems().filter(function (i) { return i.productId !== productId; }));
    }

    function clear() {
        localStorage.removeItem(STORAGE_KEY);
    }

    function getGrandTotal() {
        return getItems().reduce(function (sum, i) { return sum + i.price * i.quantity; }, 0);
    }

    window.Cart = {
        getItems: getItems,
        addItem: addItem,
        updateQuantity: updateQuantity,
        removeItem: removeItem,
        clear: clear,
        getGrandTotal: getGrandTotal
    };
})();
