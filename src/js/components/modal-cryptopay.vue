<template>
    <ModalAbstract id="modal-crypto" :closed="closed" @closed="closeDialog" @opened="openDialog">
        <div class="box" v-if="pages.form">
            <div class="columns is-mobile is-centered">
                <div class="column is-8">
                    <h1 class="title is-3 has-text-centered">Pagar con cryptomonedas</h1>
                    <form @submit.prevent="submitPay" id="create-transaction-crypto">
                        <div class="field">
                            <label for="email" class="label">Correo electr&oacute;nico</label>
                            <div class="control has-icons-left">
                                <input class="input is-medium" type="email" placeholder="Correo electronico" id="email" name="email" v-model="models.email">
                                <span class="icon is-small is-left">
                                    <i class="fas fa-envelope"></i>
                                </span>
                            </div>
                            <p class="help is-danger" v-if="formError.email">This email is invalid</p>
                            <p class="help">{{ formError.email }}</p>
                        </div>
                        <div class="field">
                            <label for="amount" class="label">Criptomoneda</label>
                            <div class="control is-expanded has-icons-left">
                                <div :class="{ 'select': true, 'is-fullwidth': true, 'is-medium': true, 'is-loading': isLoadingCurrency }">
                                    <select id="currency" name="currency" v-model="models.currency">
                                        <option value="">Seleccione una criptomoneda</option>
                                        <option v-for="currency in currencies" :key="currency" :value="currency">{{ currency }}</option>
                                    </select>
                                </div>
                                <span class="icon is-small is-left">
                                    <i class="fas fa-coins"></i>
                                </span>
                                <p class="help is-danger" v-if="formError.currency">{{ formError.currency }}</p>
                            </div>
                        </div>
                        <div class="field">
                            <label for="amount" class="label">Monto</label>
                            <div class="control">
                                <div class="field has-addons has-addons-centered">
                                    <p class="control">
                                        <a class="button is-medium is-static">$</a>
                                    </p>
                                    <p class="control">
                                        <input class="input is-medium" type="text" placeholder="0.00" id="amount" name="amount" v-model="amountVal" @keyup="parseAmountCurrency">
                                    </p>
                                    <div class="control margin-vcenter margin-center has-padding-left-10 has-padding-right-10">
                                        <span class="icon is-small">
                                            <i class="fas fa-exchange-alt"></i>
                                        </span>
                                    </div>
                                    <p class="control">
                                        <a class="button is-medium is-static">{{ models.currency }}</a>
                                    </p>
                                    <p class="control">
                                        <input class="input is-medium" type="text" placeholder="0.00000000" id="amountValue" name="amountValue" v-model="amountValPay" @keyup="parseAmountCrypto">
                                    </p>
                                </div>
                            </div>
                            <p class="help is-danger" v-if="formError.amount">{{ formError.amount }}</p>
                        </div>
                        <div class="control has-margin-top-10 has-margin-bottom-10" v-if="errorForm">
                            <div class="notification is-danger">
                              <button class="delete" @click="errorForm = null;"></button>
                              {{ errorForm }}
                            </div>
                        </div>
                        <div class="control">
                            <button :class="{ 'button': true, 'is-medium': true, 'is-fullwidth': true, 'is-info': true, 'is-loading': sending }" :disable="sending || !isValidate">Pagar</button>
                        </div>
                    </form>
                </div>
            </div>            
        </div>
        <div class="box" v-if="pages.send">
            <div class="columns is-mobile is-centered">
                <div class="column is-8 has-text-centered">
                    <h3 class="title is-3">Pague aqu&iacute;</h3>
                    <h4 class="subtitle is-">Envie los fondos a la siguiente direcci&oacute;n electr&oacute;nica</h4>
                    <code>{{ addressReceive }}</code>
                    <div class="columns is-mobile is-centered">
                        <div class="column">
                            <figure class="image">
                                <img id="qr_address" :src="urlQR">
                            </figure>
                        </div>
                    </div>
                    <p class="subtitle is-3">{{ currencyPay }} {{ amountPay }}</p>
                    <small>Le notificaremos a trav&eacute;s de su correo electr&oacute;nico cuando su pago sea confirmado.</small>
                </div>
            </div>
        </div>
        <div class="box" v-if="pages.finish">
            <div class="columns is-mobile is-centered">
                <div class="column is-8 has-text-centered">
                    <h3 class="title is-3">Pago finalizado</h3>
                    <h4 class="subtitle is-4 has-margin-bottom-10">Gracias por su transferencia</h4>
                    <div class="columns is-mobile is-centered">
                        <div class="column">
                            <span class="icon is-large notification is-success has-expanded-icon-4 is-icon-circle">
                                <i class="fas fa-check fa-5x" v-if="succesed"></i>
                                <i class="fas fa-error fa-5x" v-else></i>
                            </span>
                        </div>
                    </div>
                    <a :href="urlDetail" target="_blank" class="button is-link has-margin-top-10">Ver detalles</a>
                </div>
            </div>
        </div>
    </ModalAbstract>
</div>

</template>

<script>
import ModalAbstract from "./abstract-modal.vue"
import Coinpayments from "coinpayments"
import error_polyfill from "error-polyfill"
import Schema from "async-validator"


const client = new Coinpayments({
    key: process.env.COINPAYMENT_PUBLIC_KEY,
    secret: process.env.COINPAYMENT_PRIVATE_KEY
}),
    INTERVAL_GET_INFO = 30000, // milisegundos
    SCHEMA_CRYPTO_PAY = new Schema({
        email: { type: 'email', required: true },
        currency: { type: 'string', required: true },
        amount: { type: 'number', required: true , validator: (rule, value) => {
            return !isNaN(value) && value > 0;
        }}
    });


export default {
    name: 'modal-pay',
    components: {
        ModalAbstract
    },
    data: function () {
        return {
            models: {
                amount: null,
                currency: null
            },
            formError: {},
            pages: {
                form: true,
                send: false,
                finish: false
            },
            amountVal: null,
            amountValPay: null,
            errorForm: null,
            currencies: [],
            rates: {},
            fiats: {},
            currencyPay: null,
            amountPay: 0,
            succesed: true,
            addressReceive: null,
            urlQR: null,
            urlDetail: null,
            sending: false,
            stopRate: false,
            closed: true,
            isLoadingCurrency: false,
            isValidate: false,
            isWatch: false
        }
    },
    methods: {
        showPage (name) {
            for (var page in this.pages) {
                this.pages[page] = page === name;
                console.log(page, this.pages[page]);
            }
        },
        isActivePage (name) {
            return !!this.pages[name];
        },
        submitPay () {
            SCHEMA_CRYPTO_PAY.validate(this.models, (err, res) => {
                if (err) {
                    this.isValidate = false;
                    this.formError = {};
                    err.forEach((rule) => {
                        this.formError[rule.field] = rule.message;
                    });
                    return;
                }
                this.isValidate = true;
                this.createTransaction(this.models);
            });
        },
        createTransaction (models) {
            this.sending = true;
            client.createTransaction({
                currency1: "USD",
                currency2: models.currency,
                amount: models.amount,
                buyer_email: models.email
            })
            .then((data) => {
                this.addressReceive = data.address;
                this.urlDetail = data.status_url;
                this.urlQR = data.qrcode_url;
                this.amountPay = data.amount;
                this.currencyPay = models.currency;
                this.sending = false;
                this.stopRate = true;
                this.showPage("send");
                this.checkTransactionCrypto(data.txn_id, (error, data) => {
                    console.log(error, data);
                });
            })
            .catch((error) => {
                this.errorForm = "No se pudo procesar la transaccion!";
                this.sending = false;
                this.succesed = false;
            });
        },
        updateCurrencies() {
            if (this.isLoadingCurrency) {
                return;
            }
            if (this.sending) {
                return setTimeout(this.updateCurrencies, INTERVAL_GET_INFO);
            }
            this.isLoadingCurrency = true;
            console.log("Actualizando monedas");
            client.rates({ accepted: 1 })
            .then((data) => {
                this.currencies = [];
                this.rates = [];
                this.fiats = {};
                for (let currency in data) {
                    if (["BTC", "USD"].indexOf(currency) !== -1) {
                        this.fiats[currency] = data[currency];
                    }
                    if (process.env.NODE_ENV !== "development" && (
                        !data[currency]
                        || data[currency].can_convert == 0
                        || data[currency].accepted == 0
                        || data[currency].capabilities.indexOf("payments") === -1
                        || parseFloat(data[currency].rate_btc) < 1e-8
                        )) {
                        // Saltar monedas que no sean intercambiables, no aceptadas en pagos
                        // y que el valor de intercambio en btc sea menor a un satoshi.
                        continue;
                    }
                    this.rates[currency] = data[currency];
                    this.currencies.push(currency);
                }
                this.fiats.BTC.rate_usd = 1 / this.fiats.USD.rate_btc;
                for (let currency in this.rates) {
                    this.rates[currency].rate_usd = this.fiats.BTC.rate_usd * this.rates[currency].rate_btc;
                }
                if (this.stopRate) {
                    return;
                }
                this.isLoadingCurrency = false;
                setTimeout(this.updateCurrencies, INTERVAL_GET_INFO);
            })
            .catch((error) => {
                this.isLoadingCurrency = false;
                setTimeout(this.updateCurrencies, INTERVAL_GET_INFO);
            });
        },
        checkTransactionCrypto (txid, callback) {
            var loop = (error) => {
                if (error) {
                    this.succesed = false;
                    callback(error, null);
                }
                setTimeout(this.checkTransactionCrypto.bind(this, txid, callback), INTERVAL_GET_INFO);
            };
            client.getTx({ txid: txid })
            .then((data) => {
                if (typeof callback === "function") {
                    callback(null, data);
                }
                if (data.status === 0) {
                    return loop();
                }
                this.succesed = data.status === 1;
                this.showPage("finish");
            })
            .catch(loop);
        },
        closeDialog() {
            this.closed = true;
            this.stopRate = true;
            if (this.isActivePage("finish")) {
                this.showPage("form");
            }
        },
        openDialog () {
            console.log("abierto el dialogo");
            this.stopRate = false;
            this.sending = false;
            this.succesed = false;
            this.updateCurrencies();
        },
        parseAmountCurrency (event) {
            var keyCodeIgnore = [8, 13, 16, ];
            var amount = this.amountVal;
            if (keyCodeIgnore.indexOf(event.keyCode) === -1) {
                if (amount) {
                    var formatAmount;
                    amount = amount.trim();
                    if (amount.length <= 2) {
                        formatAmount = (amount * 1e-2);
                    } else {
                        formatAmount = (
                            (amount
                                .replace(/\D/g, "")
                                .replace(/([0-9])([0-9]{2})$/, '$1.$2')
                            ) * 1);
                    }
                    if (!isNaN(formatAmount)) {
                        amount = this.amountVal = formatAmount.toFixed(2);
                    } else {
                        amount = this.amountVal = "0.00";
                    }
                }
            }
            this.models.amount = amount;            
            if (this.models.currency) {
                this.amountValPay = amount / this.rates[this.models.currency].rate_usd;
            }
        },
        parseAmountCrypto (event) {
            var amount = this.amountValPay;
            if (this.models.currency) {
                var formatAmount = amount * this.rates[this.models.currency].rate_usd;
                this.amountVal = formatAmount.toFixed(2);
            }
        }
    },
}
</script>