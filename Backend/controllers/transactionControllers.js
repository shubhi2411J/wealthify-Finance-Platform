const User = require("../models/userModel");
const Account = require("../models/accountModel");
const Transaction = require("../models/transactionModel");
const Budget = require("../models/budgetModel");
const { default: mongoose } = require("mongoose");
const arcjetInit = require("../lib/arcjet");
const dotenv = require("dotenv");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}

const postTransaction = async (req, res) => {
  try {
    const { userId } = req.body;
    const { data } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    //arcjet function to rate limiting
    if (process.env.ARCJET_ENV === "development") {
      const originalWarn = console.warn;
      console.warn = (message, ...args) => {
        if (!message.includes("Aj WARN Using 127.0.0.1")) {
          originalWarn(message, ...args);
        }
      };
    }
    try {
      const aj = await arcjetInit;

      const decision = await aj.protect(req, {
        userId,
        requested: 1, //specify how many tokens to consume
      });

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return res
            .status(429)
            .json({ error: "TOO MANY REQUESTS, PLEASE TRY AGAIN LATER" });
        } else {
          return res.json({ error: "REQUEST BLOCKED" });
        }
      }
    } catch (error) {
      return res.status(500).json({ error: "Rate limiting service error" });
    }

    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const account = await Account.find({
      _id: data.accountId,
      userId: user.id,
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance =
      parseFloat(account[0].balance.toString()) + balanceChange;

    const session = await mongoose.startSession();

    await session.withTransaction(async () => {
      const newTransaction = new Transaction({
        ...data,
        userId: user.id,
        nextRecurringDate:
          data.isRecurring && data.recurringInterval
            ? calculateNextRecurringDate(data.date, data.recurringInterval)
            : null,
      });

      await newTransaction.save();

      const account = await Account.findById({ _id: newTransaction.accountId });

      account.transactions.push(newTransaction._id);
      user.transactions.push(newTransaction._id);
      await account.save();
      await user.save();

      await Account.findByIdAndUpdate(
        { _id: newTransaction.accountId },
        { $set: { balance: newBalance } }
      );

      session.endSession();
      return res.json(newTransaction);
    });
  } catch (error) {
    return res.status(500).json({ message: "Error posting transaction" });
  }
};

const getFromAccountDBForTransaction = async (req, res) => {
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

const postScanReceipt = async (req, res) => {
  const storage = multer.memoryStorage(); // Store file in memory (RAM)
  const upload = multer({ storage: storage });

  if (!req.file) {
    return res.status(400).json({ error: "No file received" });
  }
  const file = req.file;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    //convert file to array buffer
    const arrayBuffer = file.buffer.buffer.slice(
      file.buffer.byteOffset,
      file.buffer.byteOffset + file.buffer.byteLength
    );

    //convert arrayBuffer to Base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.mimetype,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      return res.json({
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      });
    } catch (parseError) {
      return res.json({ error: "INVALID RESPONSE FORMAT FROM GEMINI" });
    }
  } catch (error) {
    return res.json({ error: "FAILED TO SCAN RECEIPT" });
  }
};

const getTransaction = async (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId;

  try {
    if (!userId) {
      return res.json({ error: "Unauthorized" });
    }

    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return res.json({ error: "Error while checking user" });
    }
    const transaction = await Transaction.find({ _id: id, userId: user.id });
    if (!transaction) {
      return res.json({ error: "Transaction not found" });
    }

    return res.json(transaction);
  } catch (error) {
    return res.json({ error: "Error while fetching transaction" });
  }
};

const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  const { userId } = req.body;

  const session = await mongoose.startSession();

  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const originalTransaction = await Transaction.findOne({
      _id: id,
      userId: user.id,
    }).populate("accountId");

    if (!originalTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Calculate balance change
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount
        : originalTransaction.amount;

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    let updatedTransaction = null;

    // Start transaction
    await session.withTransaction(async () => {
      updatedTransaction = await Transaction.findOneAndUpdate(
        { _id: id, userId: user.id },
        {
          $set: {
            ...data,
            nextRecurringDate:
              data.isRecurring && data.recurringInterval
                ? calculateNextRecurringDate(data.date, data.recurringInterval)
                : null,
          },
        },
        { new: true, session } //session is passed correctly
      );

      if (!updatedTransaction) throw new Error("Transaction update failed");

      await Account.findOneAndUpdate(
        { _id: data.accountId },
        { $inc: { balance: netBalanceChange } },
        { new: true, session }
      );
    });

    session.endSession(); //  Session is closed after success

    return res.status(200).json(updatedTransaction); //Send response only after successful commit
  } catch (error) {
    await session.abortTransaction(); // Rollback changes on error
    session.endSession();
    return res
      .status(500)
      .json({ error: error.message || "Transaction update failed" });
  }
};
module.exports = {
  postTransaction,
  getFromAccountDBForTransaction,
  postScanReceipt,
  getTransaction,
  updateTransaction,
};
