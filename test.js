let axios = require("axios");
const { param } = require("jquery");
const file = "E:/contract/test1.sol";
axios
  .get("http://localhost:8081/compile", {
    params: {
      file: file,
    },
  })
  .then((res) => {
    console.log(res.data);
  })
  .catch((err) => {
    console.log(err);
  });
