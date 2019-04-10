const Vue = require("vue"),
    ModalPay = require("./components/modal-cryptopay.vue").default;


window.addEventListener("load", function () {
  console.log("DOM activado");
    var modalCryptoPay = new Vue({
      el: "#elements",
      template: '<modal-pay ref="modal"/>',
      components: { ModalPay }
    });
    document.getElementById("button-cryptopayment")
      .addEventListener("click", function () {
          modalCryptoPay.$refs.modal.closed = false;
      });
});