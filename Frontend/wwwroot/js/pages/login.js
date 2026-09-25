(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        var form = document.getElementById("loginForm");
        var returnUrl = form.querySelector('input[name="returnUrl"]').value;

        Api.submitJsonForm(form, {
            url: "api/account/login",
            transform: function (payload) {
                delete payload.returnUrl;
                return payload;
            },
            onSuccess: function (data) {
                Auth.saveAuth(data);
                window.location.href = (returnUrl && returnUrl.startsWith("/")) ? returnUrl : "/";
            }
        });
    });
})();
