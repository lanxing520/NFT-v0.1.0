<template>
  <div class="story container mt-4">
    <div class="card mb-3">
      <div class="card-body">
        <div class="d-flex">
          <h2 class="h2 m-0">{{ data.title }}</h2>
          <p class="text-right mt-2">{{ data.date | showDate }}</p>
        </div>
        <p class="text-muted">By {{ data.authorName }}</p>

        <p class="text-muted">{{ data.preview }}</p>

        <!-- <a v-bind:href="'https://storageapi.fleek.co/ysongh-team-bucket/'+ data.description" target="_blank" rel="noopener noreferrer">
          Link to the Story
        </a> -->
        <div class="address">
          <span>NFT-ID:</span>  {{ data.contractAddress }} (contract address)
          <button
            type="button"
            class="btn btn-primary primary-bg-color"
            @click="showContractData"
          >
            查看
          </button>
        </div>
        <button class="btn btn-primary primary-bg-color" @click="buyStory()">
          Buy for {{ weiToETH }} ETH
        </button>
      </div>
    </div>
    <div class="contract-data">
      <span>
        {{ contractData }}
      </span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { dateFormat } from "../js/utils";

export default {
  name: "Story",
  data: () => ({
    data: {},
    isPurchase: false,
    contractData: "",
  }),
  computed: {
    ...mapGetters(["walletAddress", "storiesList", "storiesBlockchain"]),
    price() {
      return this.data.price;
    },
    weiToETH() {
      return window.web3.utils.fromWei(this.price, "Ether");
    },
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
    async showContractData() {
      this.contractData =
        "   * * *     * * * \n" +
        "  * * * * * * * * * \n" +
        " * * * * * * * * * * \n" +
        "  * * * * * * * * *  \n" +
        "   * * * * * * * \n" +
        "     * * * * * \n" +
        "       * * * \n" +
        "        *";
    },
  },

  async mounted() {
    this.data = await this.storiesBlockchain.methods
      .stories(this.$route.params.id)
      .call();
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

.address span{
  font-weight: 800;
  margin-right: 1vw;
}

.contract-data {
  position: relative;
  white-space: pre-wrap;
  width: 500px;
  height: 300px;
  border: 1px solid grey;
  text-align: center;
}

.contract-data span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
