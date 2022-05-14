const fromText = document.querySelector(".from-text")
toText = document.querySelector(".to-text")
exchageIcon = document.querySelector(".exchange")

icons = document.querySelectorAll(".row i");
translateBtn = document.querySelector("button");

typeTag = document.querySelector("select.blType");
const blTypes = {
    "hblNo": "House BL",
    "mblNo": "Master BL",
}
for (let blType in blTypes) {
    console.log(blType)
    let selected = 
        blType == "hblNo" ? "selected" : "";
    let option = `<option ${selected} value="${blType}">${blTypes[blType]}</option>`;
    typeTag.insertAdjacentHTML("beforeend", option);
}

yearTag = document.querySelector("select.blYear");
blYears = [2019,2020,2021,2022,2023]
blYears.forEach((year)=>{
    let selected = 
        year === 2022 ? "selected" : "";
    let option = `<option ${selected} value="${year}">${year}</option>`;
    yearTag.insertAdjacentHTML("beforeend", option);
})



fromText.addEventListener("keyup", () => {
    if(!fromText.value) {
        toText.value = "";
    }
});


translateBtn.addEventListener("click", () => {
    let text = fromText.value.trim();
    let blType =typeTag.value;
    let blYear = yearTag.value;
    let apiKey = 'j220p281p102m172d010w000w0'
    let blNo = 'HHCM2007013'
    console.log(text,blType,blYear)

    // actOnEachLine(fromText, function(line) {
    //     console.log(1 + line)
    //     return "[START]" + line + "[END]";
    // });


    if(!text) return;
    toText.setAttribute("placeholder", "조회 중...");
    // let prefix = "https://cors.bridged.cc/"
    let apiUrl = `https://unipass.customs.go.kr:38010/ext/rest/cargCsclPrgsInfoQry/retrieveCargCsclPrgsInfo?crkyCn=${apiKey}&${blType}=${blNo}&blYy=${blYear}`
    
    // let corsUrl = prefix + apiUrl
    fetch(apiUrl)
        .then(res => res.text())
        .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
        .then(data => console.log(data));
});

function getCustoms(blNo, blType, blYy){

}

function actOnEachLine(textarea, func) {
    var lines = textarea.value.replace(/\r\n/g, "\n").split("\n");
    var newLines, i;

    // Use the map() method of Array where available 
    if (typeof lines.map != "undefined") {
        newLines = lines.map(func);
    } else {
        newLines = [];
        i = lines.length;
        while (i--) {
            newLines[i] = func(lines[i]);
        }
    }
    textarea.value = newLines.join("\r\n");
}