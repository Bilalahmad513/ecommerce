(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        var form = document.getElementById("registerForm");

        Api.submitJsonForm(form, {
            url: "api/account/register",
            onSuccess: function (data) {
                Auth.saveAuth(data);
                window.location.href = "/";
            }
        });
    });
})();
