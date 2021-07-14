<template>
  <div class="story container mt-4">
    <div class="card mb-3">
      <div class="card-body">
        <div class="d-flex">
          <h2 class="h2 m-0">{{ data.title }}</h2>
          <p class="text-right mt-2">{{ data.date | showDate }}</p>
        </div>
        <p class="text-muted">By {{ data.authorName }}</p>

        <p
          class="text-muted"
          style="color:#333;font-weight:600;font-size:1.5rem"
        >
          {{ data.preview }}
        </p>

        <!-- <button class="btn btn-primary primary-bg-color" @click="fetchHash">fetch-File-Hash</button>
        <span style="margin-left:10px">{{fileHash}}</span> -->
        <div class="address">
          <span>NFT-ID:</span> {{ data.contractAddress }} (contract address)
          <button
            type="button"
            class="btn btn-primary primary-bg-color"
            @click="showContractData"
          >
            查看
          </button>
        </div>
        <button class="btn btn-primary primary-bg-color" @click="buyStory()">
          Donate {{ price }} ETH
        </button>
      </div>
    </div>
    <div class="contract-data" v-show="isShow">
      {{contractData}}
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { dateFormat } from "../js/utils";
// import fleekStorage from "@fleekhq/fleek-storage-js";
import testJson from "../abis/test.json"
// import { fleekAPIKey, fleekAPISecret } from "../config";
export default {
  name: "Story",
  data: () => ({
    data: {},
    isPurchase: false,
    isShow: false,
    price: "",
    fileHash: "",
    contractData:{}
  }),
  computed: {
    ...mapGetters([
      "walletAddress",
      "storiesList",
      "storiesBlockchain",
      "filename",
    ]),
  },
  filters: {
    showDate(value) {
      //1.将时间戳转成Date对象
      const date = new Date(value * 1000);
      //2.将date进行格式化
      return dateFormat(date, "YYYY-mm-dd  HH:MM:SS");
    },
  },
  methods: {
    async buyStory() {
      try {
        await this.storiesBlockchain.methods
          .buyStory(this.$route.params.id)
          .send({
            from: this.walletAddress,
            value: this.data.price,
            gas: 3000000,
          });

        this.isPurchase = true;
      } catch (err) {
        console.log(err);
      }
    },
    // async fetchHash() {
    //   console.log(this.data)
    //   let myFile = await fleekStorage.get({
    //     apiKey: fleekAPIKey,
    //     apiSecret: fleekAPISecret,
    //     key: this.data.description,
    //     getOptions: ["key", "hash"],
    //   });
    //   this.fileHash = myFile.hash;
    // },
    async showContractData() {
      this.isShow = true;
      const web3 = window.web3;
      const address = this.data.contractAddress;
      const contract = new web3.eth.Contract(testJson.abi, address);
      this.contractData = await contract.methods.get().call()
    }
  },

  async mounted() {
    this.data = await this.storiesBlockchain.methods
      .stories(this.$route.params.id)
      .call();
    this.price = window.web3.utils.fromWei(this.data.price, "Ether");
  },
};
</script>

<style scoped>
h2 {
  flex: 1 !important;
}

.story {
  min-height: 70vh;
}

.address {
  margin: 1vw 0;
  white-space: pre-wrap;
}

.address span {
  font-weight: 800;
  margin-right: 1vw;
}

/* .contract-data {
  position: relative;
  white-space: pre-wrap;
  width: 500px;
  height: 300px;
  border: 1px solid grey;
  text-align: center;
} */

.contract-data img {
  /* position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); */
  width: 72vw;
  margin-bottom: 20px;
}
</style>
