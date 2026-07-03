const fs = require("fs");
const code = fs.readFileSync("node_modules/pdf-parse/dist/pdf-parse/cjs/index.cjs", "utf8");

let pos = 0;
while (true) {
  pos = code.indexOf("atob", pos);
  if (pos === -1) break;
  console.log(`Match at index ${pos}:`);
  console.log(code.substring(Math.max(0, pos - 100), Math.min(code.length, pos + 100)));
  console.log("---------------------------------------");
  pos += 4;
}
