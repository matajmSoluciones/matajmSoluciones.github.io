const Coinpayments = require("coinpayments");
const client = new Coinpayments({
    key: process.env.COINPAYMENT_PUBLIC_KEY,
    secret: process.env.COINPAYMENT_PRIVATE_KEY
});

var rates = {};
const INTERVAL_GET_INFO = 30000; // milisegundos

window.addEventListener("load", function () {
    var selectCurrency = document.getElementById("currency"),
        helpAmountCurrency = document.getElementById("format-currency"),
        formCrypto = document.getElementById("create-transaction-crypto"),
        amountElement = document.getElementById("amount"),
        modalCloseCrypto1 = document.querySelector("#modal-crypto .modal-close"),
        receiveModal = document.getElementById("modal-crypto-receive"),
        addressHelp = document.getElementById("address-help"),
        qrAddress = document.getElementById("qr_address"),
        emailField = document.getElementById("email");
    selectCurrency.addEventListener("change", function (event) {
        var key = this.value;
        if (!key) {
            helpAmountCurrency.innerHTML = "";
            return;
        }
        helpAmountCurrency.innerHTML = "<strong>" + key + "</strong>";
    });
    client.rates({ accepted: 1 })
    .then(function (data) {
        for (var currency in data) {
            if (!data[currency]
                || data[currency].can_convert == 0
                || data[currency].accepted == 0
                || data[currency].capabilities.indexOf("payments") === -1
                || parseFloat(data[currency].rate_btc) < 1e-8) {
                // Saltar monedas que no sean intercambiables, no aceptadas en pagos
                // y que el valor de intercambio en btc sea menor a un satoshi.
                continue;
            }
            rates[currency] = data[currency];
            var option = document.createElement("option");
            option.innerText = option.value = currency;
            selectCurrency.appendChild(option);
        }
    })
    .catch(function (error) {
        console.error(error);
    });
    formCrypto.addEventListener("submit", function (event) {
        event.preventDefault();
        client.createTransaction({
            currency1: selectCurrency.value,
            currency2: "BTC",
            amount: amountElement.value,
            buyer_email: emailField.value
        })
        .then(function (data) {
            function loadModal() {
                modalCloseCrypto1.click();
                receiveModal.classList.add("is-active");
            }
            addressHelp.innerText = data.address;
            qrAddress.src = data.qrcode_url;
            qrAddress.onload = loadModal;
            qrAddress.onerror = loadModal;
            console.log(data);
        })
        .catch(function (error) {
            console.error(error);
        });
    });
});

function checkTransactionCrypto (txid, modal) {
    function loop () {
        setTimeout(checkTransactionCrypto.bind(this, txid, modal), INTERVAL_GET_INFO);
    }
    client.getTx({ txid: txid })
    .then(function (data) {
        if (data.status === 0) {
            return loop();
        }
        if (data.status === 1) {

        }
    })
    .catch(loop);
}