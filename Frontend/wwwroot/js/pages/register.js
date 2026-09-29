(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        var form = document.getElementById("registerForm");
        var password = document.getElementById("regPassword");
        var confirmPassword = document.getElementById("regConfirmPassword");

        function validatePasswordsMatch() {
            confirmPassword.setCustomValidity(
                confirmPassword.value && confirmPassword.value !== password.value
                    ? "Passwords do not match."
                    : ""
            );
        }
        password.addEventListener("input", validatePasswordsMatch);
        confirmPassword.addEventListener("input", validatePasswordsMatch);

        Api.submitJsonForm(form, {
            url: "api/account/register",
            transform: function (payload) {
                delete payload.confirmPassword;
                return payload;
            },
            onSuccess: function (data) {
                Auth.saveAuth(data);
                window.location.href = "/";
            }
        });
    });
})();
