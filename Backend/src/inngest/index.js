const { Inngest } = require("inngest");
const User = require("../../models/userModel");
const Account = require("../../models/accountModel");
const Transaction = require("../../models/transactionModel");
const Budget = require("../../models/budgetModel");
const { mongoose } = require("mongoose");
const { sendEmail } = require("../../emails/sendEmail");

const inngest = new Inngest({
  id: "wealthify",
  name: "Wealthify",
  retryFunction: async (attempt) => ({
    delay: Math.pow(2, attempt) * 1000,
    maxAttempts: 2,
  }),
});
// Your new function:
const checkBudgetAlert = inngest.createFunction(
  { name: "Check Budget Alert" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const budgets = await step.run("fetch budget", async () => {
      return await Budget.find().populate({
        path: "user",
        populate: { path: "accounts" },
      });
    });

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts.find((acc) => acc.isDefault);

      if (!defaultAccount) continue;
      await step.run(`check-budget-${budget.id}`, async () => {
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
            userId: budget.user._id,
            type: "EXPENSE",
            date: { $gte: startOfMonth, $lte: endingOfMonth },
            accountId: defaultAccount._id,
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

        const totalExpenses = expenses || 0;
        const budgetAmount = budget.amount.$numberDecimal;
        const percentUsed = (totalExpenses / budgetAmount) * 100;

        if (
          percentUsed >= 80 &&
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), new Date()))
        ) {
          //send emails

          await sendEmail({
            to: budget.user.email,
            subject: `Budget Alert for ${defaultAccount.name}`,
            react: {
              userName: budget.user.name,
              type: "budget-alert",
              data: {
                percentUsed,
                budgetAmount: parseInt(budgetAmount),
                totalExpenses: parseInt(totalExpenses),
                accountName: defaultAccount.name,
              },
            },
          });

          await Budget.updateMany(
            { id: budget.id },
            { $set: { lastAlertSent: new Date() } }
          );
        }
      });
    }
  }
);
const isNewMonth = (lastAlertDate, currentDate) => {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth(),
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
};
// Add the function to the exported array:
const functions = [checkBudgetAlert];

module.exports = { inngest, functions };
