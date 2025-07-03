const { Schema, model, default: mongoose } = require("mongoose");

const UserDataSchema = new Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
    },
    
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    transactions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "TransactionData" },
    ],
    accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "AccountData" }],
    budgets: [{ type: mongoose.Schema.Types.ObjectId, ref: "BudgetData" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }, 
    
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

const UserModel = model("UserData", UserDataSchema);
module.exports = UserModel;
