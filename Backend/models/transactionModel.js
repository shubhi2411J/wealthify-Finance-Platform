const { Schema, model, default: mongoose } = require("mongoose");

const TransactionDataSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["INCOME", "EXPENSE"],
      required: true,
    },

    amount: { type: mongoose.Types.Decimal128, required: true },

    description: { type: String, default: null },

    date: { type: Date, required: true },

    category: { type: String, required: true },

    receiptUrl: { type: String, default: null },

    isRecurring: { type: Boolean, default: false },

    recurringInterval: {
      type: String,
      enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
      default: null,
    },

    nextRecurringDate: { type: Date, default: null },

    lastProcessed: { type: Date, default: null },

    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"], // TransactionStatus enum
      default: "COMPLETED",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountData",
      required: true,
    },

    createdAt: { type: Date, default: Date.now },

    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const TransactionModel = model("TransactionData", TransactionDataSchema);
module.exports = TransactionModel;
