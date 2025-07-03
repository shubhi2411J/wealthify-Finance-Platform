const { Schema, model, default: mongoose } = require("mongoose");

const BudgetDataSchema = new Schema(
  {
    amount: { type: mongoose.Types.Decimal128, required: true },

    lastAlertSent: { type: Date, default: null },

  
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },

    createdAt: { type: Date, default: Date.now },

    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

const BudgetModel = model("BudgetData", BudgetDataSchema);
module.exports = BudgetModel;
