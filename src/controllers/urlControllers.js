const urlModel = require("../models/urlmodel");
const redis = require("redis");
const { promisify } = require("util");

const redisClient = redis.createClient(
  16328,
  "redis-16328.c264.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth(
  "2FBFdIZBq2aIp2hUi3jkXiqxFe2mGymh",

  function (err) {
    if (err) throw err;
  }
);

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});
const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const validUrl = require("valid-url");
const shortid = require("shortid");
const baseUrl = "http://localhost:3000";

const isvalidStringOnly = function (value) {
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const isValidRequestBody = (RequestBody) => {
  return Object.keys(RequestBody).length > 0;
};

const urlshorten = async function (req, res) {
  try {
    const longUrl = req.body.longUrl;
    if (!isValidRequestBody(req.body)) {
      return res.status(400).send({ status: false, msg: "you can't send empty body" });
    }
    if (!isvalidStringOnly(longUrl)) {
      return res.status(400).send({ status: false, msg: "please give link" });
    }
    if (!validUrl.isUri(baseUrl)) {
      return res.status(400).send({ status: false, msg: "Invalid base URL" });
    }


    const urlCode = shortid.generate().toLowerCase();

    if (validUrl.isUri(longUrl)) {
      let cachedData = await GET_ASYNC(`${longUrl}`);
      //console.log(cachedData)
      if (cachedData) {
        const data = JSON.parse(cachedData)

        return res.status(200).send({ status: true, msg: "already created", data: data });
      }

      let url = await urlModel.findOne({ longUrl }).select({ _id: 0, __v: 0 });



      if (url) {
        return res.status(200).send({ status: true, data: JSON.parse(url) });
      } else {
        const shortUrl = baseUrl + "/" + urlCode;
        await SET_ASYNC(`${longUrl}`, JSON.stringify({ longUrl, shortUrl, urlCode }));

        url = await urlModel.create({
          longUrl,
          shortUrl,
          urlCode,
        });

        const result = {
          longUrl: url.longUrl,
          shortUrl: url.shortUrl,
          urlCode: url.urlCode,
        };

        res.status(201).send({ status: true, data: result });
      }
    } else {
      res.status(400).send("Invalid longUrl");
    }
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};
// ==============================================================================================================

let geturl = async function (req, res) {
  try {
    let urlCode = req.params.urlCode;
    if (!isvalidStringOnly(urlCode)) {
      return res.status(400).send({ status: false, msg: "not valid urlCode" });
    }
    let cachedData = await GET_ASYNC(`${urlCode}`);
    
    if (cachedData) {
      const data = JSON.parse(cachedData)

      return res.status(302).redirect(data.longUrl)
    }

    else {
      let fetchUrl = await urlModel.findOne({ urlCode })


      await SET_ASYNC(`${urlCode}`, JSON.stringify(fetchUrl))

      if (fetchUrl) {
        return res.status(302).redirect(fetchUrl.longUrl)
      }

      else {
        return res.status(404).send({ status: false, msg: " this urlCode not found" });
      }
    }


  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

module.exports.urlshorten = urlshorten;
module.exports.geturl = geturl;
