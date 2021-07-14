#!/usr/bin/env node
// OPTIONS:
// -d: development mode. If set, open 'localhost:8080' in the browser, use the local build instead
// --path=<PATH>: path to the default directory (optional, use working directory if missing)

const argv = require("minimist")(process.argv.slice(2));
for (let key in process.argv) {
  if (process.argv[key].startsWith("--path=")) {
    process.argv.splice(key, 1);
    break;
  }
}

const FILE_SEPARATOR = process.platform == "win32" ? "\\" : "/";
var directory = argv.path ? argv.path : process.cwd();
const PORT = 8081;
const FORBIDDEN_CHARACTERS =
  "\\\\|<|>|:|\\\"|\\'|\\||\\?|\\*|~|#|\\n|\\t|\\v|\\f|\\r";
const fs = require("fs");
const solc = require("solc");
const express = require("express");
const bodyParser = require("body-parser");
const Web3 = require("web3");
const app = express();

const currentProvider = new Web3.providers.HttpProvider(
  "http://localhost:7545"
);
const web3 = new Web3(currentProvider);

const ignored = ["build", "node_modules"];

console.log("Starting solc server...");

if (!directory.endsWith(FILE_SEPARATOR)) directory += FILE_SEPARATOR;

if (!fs.existsSync(directory) || !fs.lstatSync(directory).isDirectory()) {
  console.error('"' + directory + "\" doesn't exist or is not a directory.");
  process.exit(1);
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "OPTIONS, HEAD, GET, POST, PUT, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Content-Type", "application/json");
  next();
});

app.get("/compile", function(req, res) {
  if (req.query) {
    let res = req.query;
    const input = 
    "// SPDX-License-Identifier: GPL-3.0\n"+
    "pragma solidity >=0.4.16 <0.9.0;"+
    "contract Storage {"+
        "function get() public pure returns(string memory title,string memory authorName,string memory preview,"+
          "string memory price,string memory fileHash){"+
        
         `title = unicode'${res.title}';`+
         `authorName = unicode'${res.authorName}';`+
         `preview = unicode'${res.preview}';`+
         `price = '${res.price}';`+
         `fileHash = '${res.uploadedFileHash}';`+
         "return(title,authorName,preview,price,fileHash);}}" ;

    console.log(input);

    let jsonContractSource = JSON.stringify({
      language: "Solidity",
      sources: {
        "test1.sol": {
          // 指明编译的文件名
          content: input, // solidity 源代码
        },
      },
      settings: {
        // 自定义编译输出的格式。以下选择输出全部结果。
        outputSelection: {
          "*": {
            "*": ["*"],
          },
        },
      },
    });

    // 编译得到结果
    let output = JSON.parse(solc.compile(jsonContractSource));
    console.log("output:", output);
    var teamJson = {
      abi: {},
      bytecode: "",
    };
    // output 为json对象，根据json结构保存对应的abi和bytecode
    for (var contractName in output.contracts["test1.sol"]) {
      teamJson.abi = output.contracts["test1.sol"][contractName].abi;
      teamJson.bytecode =
        output.contracts["test1.sol"][contractName].evm.bytecode.object;
    }

    fs.writeFile("./src/abis/test.json", JSON.stringify(teamJson), function(err) {
      if (err) console.error(err);
      console.log("team contract compiled sucessfully.");
    });
console.log(teamJson)
    // res.send(teamJson);
    // Contract object
  }
  res.send(teamJson);
  res.end();
});

// Fetch file
app.get("/file", function(req, res) {
  if (req.query.file) {
    let file = directory + req.query.file;
    if (process.platform == "win32") {
      file = file.replace(/\//g, FILE_SEPARATOR);
    }
    if (validateFile(file, res)) {
      try {
        res.end(fs.readFileSync(file).toString());
        console.log("Fetch file: " + file);
      } catch (error) {
        res.status(403);
        res.end(error.message);
        console.log("Couldn't fetch file: " + file);
      }
    }
  } else {
    res.status(400);
    res.end("File is required.");
  }
});

function rmdir(path) {
  let files = [];
  while (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    for (let key in files) {
      const curPath = path + FILE_SEPARATOR + files[key];
      if (fs.lstatSync(curPath).isDirectory()) {
        rmdir(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    }
    try {
      fs.rmdirSync(path);
    } catch (err) {
      /* try again if failed (windows patch) */
    }
  }
}

// TODO Create directory without creating file

//------------------------------------

// app.get('/shutdown', function() {
//     console.log('IDE closed, exiting.')
//     process.exit(0)
// })

app.listen(PORT, "localhost", function() {
  console.log(
    "Started solc server. Listening on localhost:" +
      PORT +
      ', directory "' +
      directory +
      '"'
  );
});

if (argv.noganache !== true) {
  setTimeout(function() {
    console.log("Starting ganache...");
    require("ganache-cli/cli");
  }, 1);
}

if (argv.d !== true) {
  // Not in dev mode
  let url = '"file://' + __dirname + '/dist/index.html"';

  if (process.platform == "win32") url = '"" ' + url;

  const start =
    process.platform == "darwin"
      ? "open"
      : process.platform == "win32"
      ? "start"
      : "xdg-open";
  require("child_process").exec(start + " " + url);
}
