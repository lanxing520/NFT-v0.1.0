<template>
  <div class="container">
    <div class="card m-auto">
      <h2 class="card-header text-center py-4">Make a wish</h2>

      <form class="card-body px-5" @submit="addStory">
        <div class="form-group">
          <label class="font-weight-bold">Title</label>
          <input
            class="form-control"
            type="text"
            name="title"
            v-model="title"
          />
        </div>

        <div class="form-group">
          <label class="font-weight-bold">Author Name</label>
          <input
            class="form-control"
            type="text"
            name="authorName"
            v-model="authorName"
          />
        </div>

        <div class="form-group">
          <label class="font-weight-bold">Write your wish</label>
          <textarea
            class="form-control"
            type="text"
            name="preview"
            v-model="preview"
            style="height:150px"
          />
        </div>

        <div class="form-group">
          <label class="font-weight-bold">The path of the ASCII solidity</label>
          <div class="input-group">
            <div class="custom-file">
              <input type="text" v-model="filePath" class="form-control" />
              <input type="file" class="custom-file-input" @change="getFile" />
              <label class="custom-file-label">{{ fileName }}</label>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="font-weight-bold">Donate</label>
          <input
            class="form-control"
            type="text"
            name="price"
            v-model="price"
          />
        </div>

        <div class="form-group">
          <label class="font-weight-bold">Wallet Address</label>
          <input
            class="form-control"
            type="text"
            name="address"
            v-model="address"
          />
        </div>

        <input
          type="submit"
          value="Add"
          class="btn btn-primary primary-bg-color btn-block btn-lg"
        />
      </form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import fleekStorage from "@fleekhq/fleek-storage-js";

import { fleekAPIKey, fleekAPISecret } from "../config";

export default {
  name: "CreateStory",
  data: () => ({
    title: "",
    authorName: "",
    preview: "",
    description: "",
    price: "",
    address: "",
    uploadedFileHash: "",
    file: null,
    fileName: "",
    selected: null,
    filePath: "./contracts/test1.sol",
    contractAddress: "",
  }),
  computed: mapGetters(["walletAddress", "storiesBlockchain"]),
  methods: {
    compile: function() {
      window.axios
        .get("http://localhost:8081/compile", {
          params: {
            title: this.title,
            authorName: this.authorName,
            preview: this.preview,
            price: this.price,
            uploadedFileHash: this.uploadedFileHash
          },
        })
        .then((res) => {
          this.errors = res.data.errors;
          if (res.data != undefined) {
            let abi = res.data.abi;
            let bytecode = res.data.bytecode;
            new window.web3.eth.Contract(abi)
              .deploy({
                data: "0x" + bytecode, // 需要注意 字节码需要添加 '0x' 不然会有各种错误
                // arguments: [teamName], // 此处是参数列表
              })
              .send({
                from: this.address,
                gas: "5000000",
              })
              .then((res) => {
                console.log("successfully! Contract address: " + res._address);
                this.contractAddress = res._address;
                this.storiesBlockchain.methods
                  .createStory(
                    this.title,
                    this.authorName,
                    this.preview,
                    this.description,
                    this.contractAddress,
                    window.web3.utils.toWei(this.price.toString(), "Ether")
                  )
                  .send({ from: this.address, gas: 3000000 });
              });
          }
        });
    },
    async getFile(event) {
      const file = event.target.files[0];
      this.file = file;
      this.fileName = file.name;
    },
    async addStory(e) {
      e.preventDefault();

      const uploadedFile = await fleekStorage.upload({
        apiKey: fleekAPIKey,
        apiSecret: fleekAPISecret,
        key: this.file.name,
        data: this.file,
      });
      this.uploadedFileHash = uploadedFile.hash;
      this.description = uploadedFile.key;
      await GlobalEvent.$emit("compile");
      this.$router.push("/");
    },
  },
  mounted() {
    this.address = this.walletAddress;
    GlobalEvent.$on("compile", this.compile);
  },
  beforeDestroy() {
    GlobalEvent.$off("compile", this.compile);
  },
};
</script>

<style scoped>
.card {
  max-width: 500px !important;
  margin-top: 3rem !important;
}
</style>
