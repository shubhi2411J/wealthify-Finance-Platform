const { Schema, model, default: mongoose } = require("mongoose");

const AccountDataSchema = new Schema(
  {
    name: {
      type: String,
    },
    type: {
      type: String,
      enum: ["CURRENT", "SAVINGS"],
    },
    balance: {
      type: mongoose.Types.Decimal128,
    },
    isDefault: {
      type: Boolean,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    transactions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "TransactionData" },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

const AccountModel = model("AccountData", AccountDataSchema);
module.exports = AccountModel;
