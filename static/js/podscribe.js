// main.js
function getData(dataSelect) {
  try {
    const inlineJsonElement = document.querySelector(
      `script[type="application/json"][data-cwc-selector="${dataSelect}"]`
    );
    const data = JSON.parse(inlineJsonElement.textContent);
    return data;
  } catch (err) {
    console.error(`Couldn't read JSON data from ${dataSelect}`, err);
  }
}

const episode = getData("episode-data");

var podscribeEmbedVars = {
  epGuid: episode.epGuid,
  rssUrl: 'https://www.cloudwithchris.com/episode/index.xml',
  backgroundColor: '#CFDCE1',
  font: undefined,
  fontColor: undefined,
  speakerFontColor: '#25A6D9',
  height: '1000px',
  showEditButton: true,
  showSpeakers: true,
  showTimestamps: true
};