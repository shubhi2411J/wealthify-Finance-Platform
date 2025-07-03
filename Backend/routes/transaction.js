const express = require("express");
const {
  getFromAccountDBForTransaction,
  postTransaction,
  postScanReceipt,
  getTransaction,
  updateTransaction,
} = require("../controllers/transactionControllers");
const upload = require("../multer.config");

const router = express.Router();

router.get("/transaction/create", getFromAccountDBForTransaction);
router.post("/transaction/create", postTransaction);
router.post(
  "/transaction/scan-receipt",
  upload.single("file"),
  postScanReceipt
);
router.get("/transaction/edit/:id", getTransaction);
router.put("/transaction/edit/:id", updateTransaction);

module.exports = router;
