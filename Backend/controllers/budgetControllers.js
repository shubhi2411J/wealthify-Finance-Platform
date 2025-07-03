const User = require("../models/userModel");
const Account = require("../models/accountModel");
const Transaction = require("../models/transactionModel");
const Budget = require("../models/budgetModel");

const getCurrentBudget = async (req, res) => {
  try {
    const userId = req.query.userId;
    const accountId = req.query.accountId;

    if (!userId) {
      throw new Error("Unauthorized");
    }
    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      throw new Error("User not found");
    }

    const budget = await Budget.findOne({ user: user.id });

    const currentDate = new Date();

    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endingOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const transactions = await Transaction.find(
      {
        userId: user.id,
        type: "EXPENSE",
        date: { $gte: startOfMonth, $lte: endingOfMonth },
        accountId: accountId,
      },
      { amount: 1 }
    );

    const formattedTransactions = transactions.map((t) => ({
      amountAsNumber: parseFloat(t.amount.toString()),
    }));

    const expenses = formattedTransactions.reduce(
      (sum, t) => sum + t.amountAsNumber,
      0
    );

    res.json({
      budget: budget ? { ...budget, amount: budget.amount } : null,
      currentExpenses: expenses ? expenses : 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Error checking budget" });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { userId } = req.body;
    const { amount } = req.body;

    if (!userId) {
      throw new Error("Unauthorized");
    }
    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      throw new Error("User not found");
    }

    const budget = await Budget.findOneAndUpdate(
      {
        user: user.id,
      },
      {
        $set: {
          amount: amount,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    if (budget.updatedAt === budget.createdAt) {
      user.budgets.push(budget._id);
      await user.save();
    }

    res.json({
      success: true,
      date: { ...budget, amount: budget.amount },
    });
  } catch (error) {
    res.status(500).json({ message: "Error checking budget" });
  }
};

module.exports = { getCurrentBudget, updateBudget };
