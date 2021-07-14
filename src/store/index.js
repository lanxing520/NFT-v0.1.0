import Vuex from 'vuex';
import Vue from 'vue';
import storiesBlockchain from './storiesBlockchain';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    storiesBlockchain
  }
});

export default store