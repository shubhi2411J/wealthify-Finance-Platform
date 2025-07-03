const express = require("express");
const app = express();
const { serve } = require("inngest/express");
const { inngest, functions } = require("./src/inngest/index");
const cors = require("cors");
const UserDataDB = require("./config/mongoConfig");
const dashboardRouter = require("./routes/dashboard");
const dotenv = require("dotenv");
dotenv.config();
const transactionRouter = require("./routes/transaction");
UserDataDB();
app.use(express.json());
const PORT=process.env.PORT;
const allowedOrigins = process.env.FRONTEND_URL || "http://localhost:5173";


app.use(
  cors({
    origin: allowedOrigins, // Only allow this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allow cookies/auth headers if needed
  })
);
app.get("/", (req, res) => {
  res.send("Backend is working!");
});
app.use(express.urlencoded({ extended: true }));
app.use("/", transactionRouter);
app.use("/dashboard", dashboardRouter);
app.use("/api/inngest", serve({ client: inngest, functions }));
app.listen(PORT,() => {
  console.log(`Server running at: http://localhost:${PORT}`);
});
