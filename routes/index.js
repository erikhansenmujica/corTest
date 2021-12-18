var express = require("express");
var router = express.Router();
var fs = require("fs"),
  readline = require("readline"),
  stream = require("stream");

/* GET home page. */
router.get("/", function (req, res, next) {
  var instream = fs.createReadStream("./public/words.txt");
  var outstream = new stream();
  outstream.readable = true;
  outstream.writable = true;
  const obj = {};
  var rl = readline.createInterface({
    input: instream,
    output: outstream,
    terminal: false,
  });
  rl.on("line", function (line) {
    let firstLetter = line[0].toLowerCase();
    if (obj[firstLetter]) {
      obj[firstLetter].push(line);
    } else {
      obj[firstLetter] = [];
      obj[firstLetter].push(line);
    }
    //Do your stuff ...
    //Then write to outstream
    rl.write("");
  });
  rl.on("close", async function () {
    const readable = fs.createReadStream("./public/words.txt");
    const reader = readline.createInterface({ input: readable });
    const line = await new Promise((resolve) => {
      reader.on("line", (line) => {
        reader.close();
        resolve(line);
      });
    });
    let firstLastLetter = "";
    if (line.length === 1) {
      firstLastLetter = line.toLowerCase();
    } else {
      firstLastLetter = line[line.length - 1].toLowerCase();
    }
    fs.appendFileSync("./public/wordsOutput.txt", line + "\n");
    obj[line[0].toLowerCase()].shift();
    function recursiveWriting(lastLetter = firstLastLetter) {
      if (obj[lastLetter].length) {
        let l = obj[lastLetter].shift();
        fs.appendFile("./public/wordsOutput.txt", l + "\n", function (err) {
          if (!err) recursiveWriting(l[l.length - 1].toLowerCase());
        });
      } else {
        res.render("index", {
          title: "Done! take a look in ./public/wordsOutput",
        });
      }
    }
    recursiveWriting();
    reader.close();
  });
});

module.exports = router;
