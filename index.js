const express = require("express");
const axios = require("axios");
const cron = require("node-cron");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

let data = [];

// Define a middleware function to check for a valid API key
const authenticateAPIKey = (req, res, next) => {
  const apiKey = req.query.apiKey;
  //console.log(API_KEY);
  if (apiKey === API_KEY) {
    console.log("called auth api successfully");
    next();
  } else {
    console.log("called auth api unauthorized");
    res.sendStatus(401);
  }
};

// to check logs just run fly logs

// Define a cron job to run every day at 3am in prod. job runs every min in nonprod
const cronSchedule =
  process.env.NODE_ENV === "production" ? "0 3 * * *" : "*/1 * * * *";
console.log(cronSchedule);
cron.schedule(cronSchedule, async () => {
  try {
    const responses = await getAll();
    data = responses;
    console.log("Data updated successfully");
    //console.log(data);
  } catch (e) {
    res.status(400).json(e);
  }
});

// Route to get all emotes
app.get("/data", authenticateAPIKey, async (req, res) => {
  if (data.length == 0) {
    try {
      const responses = await getAll();
      data = responses;
      //console.log(data);
    } catch (e) {
      res.status(400).json(e);
    }
  }
  res.json(data);
});

// app.get("/test", (req, res) =>{
//   res.status(200).json({
//     message: "Connection successful"
//   })
//   console.log("Called test")
// })

async function getAll() {
  // throw{
  //   status: 400,
  //   error: "Testing an error"
  // }
  console.log("called getAll");
  let responses = [];
  let emoteSet = new Set();
  for (let i = 0; i < 3; i++) {
    let apiCall = await axios.get(
      `https://api.frankerfacez.com/v1/emotes?sensitive=false&sort=count-desc&page=${
        i + 1
      }&per_page=200`
    );
    let { data } = apiCall;
    let { _pages, _total, emoticons } = data;
    //console.log("mapping");
    emoticons.map(({ id, name, usage_count, urls }) => {
      try {
        let sanitizedName = sanitizeString(name);
        // If the emote does not already exist in the array
        //console.log(emoteSet.has(sanitizedName));
        if (!emoteSet.has(sanitizedName)) {
          responses.push({
            name: sanitizedName,
            id: id,
            usage_count: usage_count,
            urls,
            urls,
          });

          emoteSet.add(sanitizedName);
        }
      } catch (e) {
        console.error(e);
      }

      // if (!(name in responses)) {
      //   responses[name] = {
      //     name: name,
      //     id: id,
      //     usage_count: usage_count,
      //     urls: urls,
      //   };
      // }
    });
  }

  return responses;
}

function sanitizeString(str) {
  str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim, "");
  return str.trim();
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
