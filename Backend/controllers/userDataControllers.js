const protectArcjet = require("../lib/botProtection");
const User = require("../models/userModel");
const dotenv = require("dotenv");
dotenv.config();
if (process.env.ARCJET_ENV === "development") {
  const originalWarn = console.warn;
  console.warn = (message, ...args) => {
    if (!message.includes("Aj WARN Using 127.0.0.1")) {
      originalWarn(message, ...args);
    }
  };
}

const postInUserDataDB = async (req, res) => {
  //arcjet function for bot detection

  // Verify Request with Arcjet
  const ajBots = await protectArcjet; // Ensure Arcjet is initialized

  // Verify Request with Arcjet
  const decision = await ajBots.protect(req);

  if (decision.isDenied()) {
    return res.status(429).json({
      error: decision.reason.isBot() ? "No Bots Allowed" : "REQUEST BLOCKED",
    });
  }

  const { userId, firstName, lastName, imageUrl, email } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User not found" });
  }

  try {
    let loggedInUser = await User.findOne({ clerkUserId: userId });

    if (!loggedInUser) {
      const name = `${firstName} ${lastName}`;
      loggedInUser = new User({
        clerkUserId: userId,
        name,
        imageUrl,
        email,
      });
      await loggedInUser.save();
    }

    res.json(loggedInUser);
  } catch (error) {
    res.status(500).json({ message: "Error checking user" });
  }
};

module.exports = { postInUserDataDB };
