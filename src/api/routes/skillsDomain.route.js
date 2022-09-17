const express = require("express");
const router = express.Router();

const {checkIfAdmin,getAuthToken, getFirebaseUid} =require('../middlewares/skills/validateUser.middleware')
const { domainController } = require('../controllers/index')


router.post('/createDomain',[getAuthToken,getFirebaseUid,checkIfAdmin],domainController.createDomain)

router.post('/updateDomain',[getAuthToken,getFirebaseUid,checkIfAdmin],domainController.updateDomain)

router.post('/readDomain',domainController.readDomain)

module.exports = router