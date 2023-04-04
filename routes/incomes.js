const router = require("express").Router();
const { updateIncome } = require("../controllers/incomes");
const { auth } = require("../config/authMiddlewares");

router.route("/update").put(auth, updateIncome);

module.exports = router;
