var mailto = require("./utils").mailto;


window.addEventListener("load", function () {
    var emailLinks = document.querySelectorAll("a[data-email]");
    for (var i = 0, n = emailLinks.length; i < n; i++) {
        var link = emailLinks[i];
        link.addEventListener("click", function (event) {
            event.preventDefault();
            mailto();
        });
    }
    var buttonsshow = document.querySelectorAll("*[data-show]");
    for (var i = 0, n = buttonsshow.length; i < n; i++) {
        var button = buttonsshow[i];
        button.addEventListener("click", function (event) {
            event.preventDefault();
            var element = document.getElementById(this.getAttribute("data-show"));
            if (!element) {
                return;
            }
            element.classList.add("is-active");
        });
    }
    var buttonclose = document.querySelectorAll(".modal .modal-close, .modal .modal-background");
    for (var i = 0, n = buttonclose.length; i < n; i++) {
        var button = buttonclose[i];
        button.addEventListener("click", function (event) {
            event.preventDefault();
            var element = event.target.parentNode;
            if (!element) {
                return;
            }
            element.classList.remove("is-active");
        });
    }
});