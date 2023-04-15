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
    // toText.value = "";
  }
});

translateBtn.addEventListener("click", () => {
  let blType = typeTag.value;
  let blYear = yearTag.value;

  if (!fromText.value) return;
  // toText.setAttribute("placeholder", "조회 중...");

  // each line is bl NO
  actOnEachLine(fromText, blType, blYear);
});

const parseXml = (xmlObject) => {


  const properties = [
    'csclPrgsStts', 'vydf', 'rlseDtyPridPassTpcd', 'prnm', 'ldprCd', 'shipNat', 'blPt',
    'dsprNm', 'etprDt', 'prgsStCd', 'msrm', 'wghtUt', 'dsprCd', 'cntrGcnt', 'cargTp',
    'shcoFlcoSgn', 'pckGcnt', 'etprCstm', 'shipNm', 'hblNo', 'prcsDttm', 'frwrSgn',
    'spcnCargCd', 'ttwg', 'ldprNm', 'frwrEntsConm', 'dclrDelyAdtxYn', 'mtTrgtCargYnNm',
    'cargMtNo', 'cntrNo', 'mblNo', 'blPtNm', 'lodCntyCd', 'prgsStts', 'shcoFlco', 'pckUt',
    'shipNatNm', 'agnc'
  ];

  const result = {};

  properties.forEach((property) => {
    const element = xmlObject.getElementsByTagName("cargCsclPrgsInfoQryVo")[0].getElementsByTagName(property)[0];
    if (element) {
      result[property] = element.textContent;
    } else {
      result[property] = null;
    }
  });

  console.log({result})

  return result;
};


// function parseXml(xmlObject) {
//   try {
//     console.log({xmlObject})
//     let status = xmlObject
//       .getElementsByTagName("cargCsclPrgsInfoQryVo")[0]
//       .getElementsByTagName("csclPrgsStts")[0].textContent;
//     let processedTime = xmlObject
//       .getElementsByTagName("cargCsclPrgsInfoQryVo")[0]
//       .getElementsByTagName("prcsDttm")[0].textContent;
//     processedTime = processedTime.replace(
//       /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g,
//       "$1-$2-$3 $4:$5:$6"
//     );

//     // console.log(status +" " + processedTime)
//     return status + " " + processedTime;
//   } catch (err) {
//     return "**BL 번호를 다시 확인해 주세요**";
//   }
// }

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
    const promisesArray = lines.map((line) => getCustoms(line, blType, blYear));
    const arrayOfValues = await Promise.all(promisesArray);
    const table = await createTableFromObjects(arrayOfValues);
    
    document.querySelector(".table-div").innerHTML = ""; // Clear the div if needed
    document.querySelector(".table-div").appendChild(table);



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


async function createTableFromObjects(objectsArray) {
  const table = document.createElement('table');
  const tableHeader = document.createElement('thead');
  const tableBody = document.createElement('tbody');

  // Create table header
  const headerRow = document.createElement('tr');
  for (const key in objectsArray[0]) {
    const headerCell = document.createElement('th');
    headerCell.textContent = key;
    headerRow.appendChild(headerCell);
  }
  tableHeader.appendChild(headerRow);
  table.appendChild(tableHeader);

  // Create table body
  objectsArray.forEach((obj) => {
    const bodyRow = document.createElement('tr');
    for (const key in obj) {
      const bodyCell = document.createElement('td');
      bodyCell.textContent = obj[key];
      bodyRow.appendChild(bodyCell);
    }
    tableBody.appendChild(bodyRow);
  });
  table.appendChild(tableBody);

  return table;
}
