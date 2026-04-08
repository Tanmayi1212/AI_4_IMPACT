const fs = require('fs');

async function testSubmit() {
  const urlEncodedData = new URLSearchParams();
  urlEncodedData.append("entry.682122354", "Test Team"); // Team Name
  urlEncodedData.append("entry.469370867", "Test College"); // College
  urlEncodedData.append("entry.1352171013", "3"); // Team size

  try {
    const googleReq = await fetch("https://docs.google.com/forms/d/e/1FAIpQLSf_UBTPQCmrSEoEUC5ajacLCzudl-Jm28yvIkF7KgJZdwUU5g/formResponse", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: urlEncodedData.toString()
    });

    const bodyText = await googleReq.text();
    fs.writeFileSync("google_rejection.html", bodyText);
    console.log("Saved to google_rejection.html. Status: ", googleReq.status);
  } catch(e) {
    console.error(e);
  }
}

testSubmit();
