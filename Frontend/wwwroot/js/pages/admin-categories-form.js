(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", async function () {
        if (!Auth.requireRole("Admin")) return;

        var form = document.getElementById("categoryForm");
        var categoryId = form.dataset.categoryId;
        var isEdit = !!categoryId;

        if (isEdit) {
            var result = await Api.get("api/categories/" + categoryId, { auth: false });
            if (result.ok) {
                form.querySelector('[name="name"]').value = result.data.name;
                form.querySelector('[name="description"]').value = result.data.description || "";
            }
        }

        Api.submitJsonForm(form, {
            url: isEdit ? "api/categories/" + categoryId : "api/categories",
            method: isEdit ? "PUT" : "POST",
            onSuccess: function () {
                window.location.href = "/Admin/Categories";
            }
        });
    });
})();
