const fromText = document.querySelector(".from-text");
toText = document.querySelector(".to-text");
exchageIcon = document.querySelector(".exchange");
icons = document.querySelectorAll(".row i");
translateBtn = document.querySelector("button");

const apiKey = "j220p281p102m172d010w000w0";

typeTag = document.querySelector("select.blType");
const blTypes = {
  hblNo: "House BL",
  mblNo: "Master BL",
};
for (let blType in blTypes) {
  console.log(blType);
  let selected = blType == "hblNo" ? "selected" : "";
  let option = `<option ${selected} value="${blType}">${blTypes[blType]}</option>`;
  typeTag.insertAdjacentHTML("beforeend", option);
}

yearTag = document.querySelector("select.blYear");
blYears = [2019, 2020, 2021, 2022, 2023];
blYears.forEach((year) => {
  let selected = year === 2022 ? "selected" : "";
  let option = `<option ${selected} value="${year}">${year}</option>`;
  yearTag.insertAdjacentHTML("beforeend", option);
});

fromText.addEventListener("keyup", () => {
  if (!fromText.value) {
    toText.value = "";
  }
});

translateBtn.addEventListener("click", () => {
  let blType = typeTag.value;
  let blYear = yearTag.value;

  if (!fromText.value) return;
  toText.setAttribute("placeholder", "조회 중...");

  // each line is bl NO
  actOnEachLine(fromText, blType, blYear);
});

function parseXml(xmlObject) {
  try {
    let status = xmlObject
      .getElementsByTagName("cargCsclPrgsInfoQryVo")[0]
      .getElementsByTagName("csclPrgsStts")[0].textContent;
    let processedTime = xmlObject
      .getElementsByTagName("cargCsclPrgsInfoQryVo")[0]
      .getElementsByTagName("prcsDttm")[0].textContent;
    processedTime = processedTime.replace(
      /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g,
      "$1-$2-$3 $4:$5:$6"
    );

    // console.log(status +" " + processedTime)
    return status + " " + processedTime;
  } catch (err) {
    return "**BL 번호를 다시 확인해 주세요**";
  }
}

// this is async function that returns a promise (fetch api always return a promise)
async function getCustoms(blNo, blType, blYear) {
  let apiUrl = `https://unipass.customs.go.kr:38010/ext/rest/cargCsclPrgsInfoQry/retrieveCargCsclPrgsInfo?crkyCn=${apiKey}&${blType}=${blNo}&blYy=${blYear}`;
  let corsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
    apiUrl
  )}`;
  // let corsUrl = prefix + apiUrl
  return fetch(corsUrl)
    .then((res) => res.json())
    .then((data) => data["contents"])
    .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
    .then((data) => parseXml(data));
}

// input is textarea and func, output is the result (as side effect)
async function actOnEachLine(textarea, blType, blYear) {
  var lines = textarea.value.replace(/\r\n/g, "\n").split("\n").filter(Boolean).map((item)=>(item.trim()));
  var newLines, i;
  console.log(lines);
  // Use the map() method of Array where available
  if (typeof lines.map != "undefined") {
    console.log("first-section");
    // resolve all the promises (array of promises)
    Promise.all(lines.map((line) => getCustoms(line, blType, blYear))).then(
      (values) => {
        console.log(values);
        toText.value = values.join("\r\n");
        // newLines = values;
      }
    );
  } else {
    console.log("second-section");

    newLines = [];
    i = lines.length;
    while (i--) {
      newLines[i] = Promise.all(getCustoms(lines[i], blType, blYear));
    }
  }
  //   toText.value = newLines.join("\r\n");
}
