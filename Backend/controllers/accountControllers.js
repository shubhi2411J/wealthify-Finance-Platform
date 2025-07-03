const User = require("../models/userModel");
const Account = require("../models/accountModel");
const Transaction = require("../models/transactionModel");
const Budget = require("../models/budgetModel");
const { default: mongoose } = require("mongoose");

const postInAccountDataDB = async (req, res) => {
  try {
    const { userId } = req.body;
    const { data } = req.body;
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      throw new Error("User not found");
    }

    const balanceFloat = parseFloat(data.balance);

    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount");
    }

    const existingAccounts = await Account.find({ userId: user.id });

    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    if (shouldBeDefault) {
      await Account.updateMany(
        {
          userId: user.id,
          isDefault: true,
        },
        { $set: { isDefault: false } }
      );
    }

    const account = new Account({
      ...data,
      balance: balanceFloat,
      userId: user.id,
      isDefault: shouldBeDefault,
    });
    await account.save();

    user.accounts.push(account._id);
    await user.save();

    return res.json(account);
  } catch (error) {
    res.status(500).json({ message: "Error checking user" });
  }
};

const getFromAccountDB = async (req, res) => {
  const id = req.query.id;

  try {
    if (!id) {
      throw new Error("Unauthorized");
    }

    const user = await User.findOne({ clerkUserId: id });

    if (!user) {
      throw new Error("User not found");
    }

    const accounts = await Account.find({
      userId: user._id,
    }).sort({ createdAt: "desc" });
    return res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: "Error checking user" });
  }
};

const putUpdateDefault = async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  try {
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      throw new Error("User not found");
    }
    await Account.updateMany(
      {
        userId: user.id,
        isDefault: true,
      },
      { $set: { isDefault: false } }
    );

    const account = await Account.findByIdAndUpdate(
      {
        _id: id,
        userId: user.id,
      },
      { $set: { isDefault: true } },
      { new: true }
    ).lean();

    return res.json(account);
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
};

const getAccountById = async (req, res) => {
  const userId = req.query.userId;
  const { id } = req.params;
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  try {
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      throw new Error("User not found");
    }

    const accounts = await Account.find({ _id: id })
      .skip(skip)
      .limit(limit)
      .populate({ path: "transactions", options: { sort: { date: -1 } } })
      .lean();

    const transactionCount = await Transaction.countDocuments({
      accountId: id,
    });
    res.json({ ...accounts, transactionCount });
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
};

const deleteAccountById = async (req, res) => {
  const userId = req.query.userId;
  const { id } = req.params;

  try {
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      throw new Error("User not found");
    }

    await Account.findByIdAndDelete({ _id: id });
    await Transaction.deleteMany({ accountId: id });
    user.accounts.pull(id);
    await user.save();
    return res.json({ success: true });
  } catch (error) {
    return res.json({ error: "Error while deleting" });
  }
};

const bulkDeleteTransactions = async (req, res) => {
  const { userId } = req.body;
  const { transactionIds } = req.body;

  try {
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      throw new Error("User not found");
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction(); // Start transaction

      // Fetch transactions to calculate balance changes
      const transactions = await Transaction.find({
        _id: { $in: transactionIds },
      }).session(session);

      const accountBalanceChanges = transactions.reduce((acc, transaction) => {
        const change =
          transaction.type === "EXPENSE"
            ? transaction.amount
            : -transaction.amount;

        acc[transaction.accountId] = parseFloat(
          (acc[transaction.accountId] || 0) + change
        );
        return acc;
      }, {});

      // Delete transactions
      const deleteTx = await Transaction.deleteMany(
        { _id: { $in: transactionIds }, userId: user.id },
        { session }
      );

      // Update account balances
      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        await Account.findByIdAndUpdate(
          accountId,
          {
            $pull: { transactions: { $in: [...transactionIds] } },
            $inc: { balance: balanceChange },
          },
          { session }
        );
      }

      user.transactions = user.transactions.filter(
        (id) => !transactionIds.includes(id.toString()) // Ensure type match
      );
      await user.save();

      // commit transaction
      await session.commitTransaction();
      res.json({ success: true, deletedCount: deleteTx.deletedCount });
    } catch (error) {
      await session.abortTransaction(); //Rollback if error occurs
      res.status(500).json({ success: false, message: error.message });
    } finally {
      session.endSession(); // session is closed
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
};

const getDashboardData = async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    throw new Error("Unauthorized");
  }
  const user = await User.findOne({ clerkUserId: userId });

  if (!user) {
    return res.json({ error: "User not found" });
  }

  const transactions = await Transaction.find({ userId: user.id }).sort({
    date: -1,
  });

  return res.json(transactions);
};

module.exports = {
  postInAccountDataDB,
  getFromAccountDB,
  putUpdateDefault,
  getAccountById,
  deleteAccountById,
  bulkDeleteTransactions,
  getDashboardData,
};
