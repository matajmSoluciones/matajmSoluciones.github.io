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
});