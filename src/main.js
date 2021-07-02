process.versions = {
    node: '' // Patch for process.versions is undefined
}

import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import App from './App.vue'
import router from './router'
import store from './store'
import "bootstrap"
import "bootstrap/dist/css/bootstrap.css"
window.Vue = Vue;
Vue.use(BootstrapVue)

require('./sass/app.scss');

Vue.config.productionTip = false
window.GlobalEvent = new Vue;

const Web3 = require('web3');
window.Web3 = Web3;
window.web3 = new Web3(new Web3.providers.HttpProvider(localStorage['ganache-host'] || 'http://localhost:7545'));

window.axios = require('axios');

new Vue({
    render: h => h(App),
    router,
  store
}).$mount('#app')

