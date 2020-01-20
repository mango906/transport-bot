const express = require("express");
const app = express();
const axios = require("axios");
const request = require("request");
const { apiKey, apiServerPath } = require("./config.json");
const http = require("http").createServer(app);

http.listen(8000, function() {
  console.log("server on!");
});

app.get("/subway", async (req, res) => {
  const start = encodeURI(req.query.start);
  const end = encodeURI(req.query.end);

  let station1 = null;
  let station2 = null;

  const promises = [
    axios.get(
      `${apiServerPath}/searchStation?apiKey=${encodeURIComponent(
        apiKey
      )}&stationName=${start}&stationClass=2`
    ),
    axios.get(
      `${apiServerPath}/searchStation?apiKey=${encodeURIComponent(
        apiKey
      )}&stationName=${end}&stationClass=2`
    )
  ];

  const promisesResolved = promises.map((promise) =>
    promise.catch((error) => ({ error }))
  );

  await axios.all(promisesResolved).then((res) => {
    const responseOne = res[0];
    const responseTwo = res[1];

    station1 = responseOne.data.result.station[0];
    station2 = responseTwo.data.result.station[0];

    axios
      .get(
        `${apiServerPath}/subwayPath?apiKey=${encodeURIComponent(
          apiKey
        )}&CID=1000&SID=${station1.stationID}&EID=${station2.stationID}`
      )
      .then((res) => {
        const { result } = res.data;
        let path = "";
        console.log(`출발점: ${result.globalStartName}`);
        console.log(`도착점: ${result.globalEndName}`);
        console.log(`총 소요시간: ${result.globalTravelTime}분`);
        result.driveInfoSet.driveInfo.forEach((el) => {
          path += `${el.startName} ${el.laneName} => `;
        });

        path += `${station2.stationName} ${station2.type}호선`;

        console.log(`경로: ${path}`);
      });
  });
});

module.exports = app;
