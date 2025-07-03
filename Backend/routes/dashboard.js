const express = require("express");
const { postInUserDataDB } = require("../controllers/userDataControllers");
const {
  postInAccountDataDB,
  getFromAccountDB,
  putUpdateDefault,
  getAccountById,
  bulkDeleteTransactions,
  getDashboardData,
  deleteAccountById,
} = require("../controllers/accountControllers");
const { getCurrentBudget, updateBudget, budgetpopu } = require("../controllers/budgetControllers");
const { default: verifyArcjet } = require("../lib/botProtection");

const router = express.Router();


router.post("/", postInUserDataDB);
router.post("/create-account", postInAccountDataDB);
router.get("/account-fetch", getFromAccountDB);
router.put("/update-default/:id", putUpdateDefault);
router.get("/account/:id", getAccountById);
router.delete("/delete-account/:id",deleteAccountById)
router.delete("/delete-transactions", bulkDeleteTransactions);
router.get("/budget",getCurrentBudget);
router.put("/budget",updateBudget);
router.get("/overview",getDashboardData)


module.exports = router;
