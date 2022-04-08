const express = require('express');
const router = express.Router();

const urlController=require("../controllers/urlControllers")

router.post("/url/shorten",urlController.urlshorten)

router.get("/:urlCode",urlController.geturl)





module.exports=router;