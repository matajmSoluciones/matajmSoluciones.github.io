<template>
    <ModalAbstract id="modal-crypto" :closed="closed" @closed="closeDialog" @opened="updateCurrencies">
        <div class="box" v-if="pages.form">
            <div class="columns is-mobile is-centered">
                <div class="column is-8">
                    <h1 class="title is-3 has-text-centered">Pagar con cryptomonedas</h1>
                    <form @submit.prevent="createTransaction" id="create-transaction-crypto">
                        <div class="field">
                            <label for="email" class="label">Correo electr&oacute;nico</label>
                            <div class="control has-icons-left">
                                <input class="input" type="email" placeholder="Correo electronico" id="email" name="email" v-model="models.email">
                                <span class="icon is-small is-left">
                                    <i class="fas fa-envelope"></i>
                                </span>
                            </div>
                            <p class="help">Notifica del estado del pago por correo.</p>
                        </div>
                        <div class="field">
                            <label for="amount" class="label">Monto</label>
                            <div class="control">
                                <div class="field has-addons has-addons-centered">
                                    <p class="control">
                                        <a class="button is-static">$</a>
                                    </p>
                                    <p class="control">
                                        <input class="input" type="text" placeholder="Monto" id="amount" name="amount" v-model="models.amount">
                                    </p>
                                    <p class="control">
                                        <span class="icon is-small has-margin-right-5 has-margin-left-5">
                                            <i class="fas fa-envelope"></i>
                                        </span>
                                    </p>
                                    <p class="control">
                                        <span class="select">
                                            <select id="currency" name="currency" v-model="models.currency">
                                                <option v-for="currency in currencies" :key="currency" :value="currency">{{ currency }}</option>
                                            </select>
                                        </span>
                                    </p>
                                    <p class="control">
                                        <input class="input" type="text" placeholder="Monto" id="amount" name="amount">
                                    </p>
                                    <p class="control">
                                        <button class="button is-info" :disable="sending">Pagar</button>
                                    </p>
                                </div>
                            </div>
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


const client = new Coinpayments({
    key: process.env.COINPAYMENT_PUBLIC_KEY,
    secret: process.env.COINPAYMENT_PRIVATE_KEY
}),
    INTERVAL_GET_INFO = 30000; // milisegundos


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
            pages: {
                form: true,
                send: false,
                finish: false
            },
            currencies: [],
            rates: {},
            currencyPay: null,
            amountPay: 0,
            succesed: true,
            addressReceive: null,
            urlQR: null,
            urlDetail: null,
            sending: false,
            stopRate: false,
            closed: true
        }
    },
    methods: {
        showPage (name) {
            for (var page in this.pages) {
                this.pages[page] = page === name;
                console.log(page, this.pages[page]);
            }
        },
        createTransaction () {
            client.createTransaction({
                currency1: "USD",
                currency2: this.models.currency,
                amount: this.models.amount,
                buyer_email: this.models.email
            })
            .then((data) => {
                this.addressReceive = data.address;
                this.urlDetail = data.status_url;
                this.urlQR = data.qrcode_url;
                this.checkTransactionCrypto(data.txn_id, (error, data) => {
                    this.sending = false;
                    if (error) {
                        this.succesed = false;
                        this.showPage("send");
                        return;
                    }
                    this.stopRate = true;
                    this.amountPay = data.amountf;
                    this.currencyPay = data.coin;
                    this.showPage("send");
                });
            })
            .catch(function (error) {
                console.error(error);
                this.sending = false;
                this.succesed = false;
                this.showPage("finish");
            });
            console.log(this.models);
        },
        updateCurrencies() {
            if (this.sending) {
                return setTimeout(this.updateCurrencies, INTERVAL_GET_INFO);
            }
            console.log("Actualizando monedas");
            client.rates({ accepted: 1 })
            .then((data) => {
                this.currencies = [];
                this.rates = [];
                for (var currency in data) {
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
                if (this.stopRate) {
                    return;
                }
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
            console.log("hola enfermera", this.closed);
            this.closed = true;
        }
    }
}
</script>