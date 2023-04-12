const express = require("express");
const axios = require("axios");
const cron = require("node-cron");

require('dotenv').config

const app = express();
const PORT = process.env.PORT || 3000;

let data = null;

// Define a cron job to run every day at 3am
const cronSchedule = process.env.NODE_ENV === 'production' ? '0 3 * * *' : '*/2 * * * *';
console.log(cronSchedule);
cron.schedule(cronSchedule, async () => {
  try {
    const responses = await getAll();
    data = response;
    console.log('Data updated successfully');
  } catch(e){
    res.status(400).json(e);
  }
});

// Route to get all emotes
app.get("/data", async (req, res) => {
  if (!data) {
    try{
      const responses = await getAll();
      data = responses
    }catch(e){
      res.status(400).json(e);
    }
    
  }
  res.json(data);
});

app.get("/test", (req, res) =>{
  res.status(200).json({
    message: "Connection successful"
  })
  console.log("Called test")
})

async function getAll() {
    // throw{
    //   status: 400,
    //   error: "Testing an error"
    // }
    console.log("called getAll");
    const responses = {};
    for (let i = 0; i < 3; i++) {
      let apiCall = await axios.get(
        `https://api.frankerfacez.com/v1/emotes?sensitive=false&sort=count-desc&page=${
          i + 1
        }&per_page=200`
      );
      let { data } = apiCall;
      let { _pages, _total, emoticons } = data;
      emoticons.map(({ id, name, usage_count, urls }) => {
        if (!(name in responses)) {
          responses[name] = { id: id, usage_count: usage_count, urls: urls };
        }
      });
    }
    
  return responses;
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
