const protectArcjet = (async () => {
  const arcjetModule = await import("@arcjet/node");
  const dotenv = require("dotenv");
  dotenv.config();

  const arcjet = arcjetModule.default;
  const { shield, detectBot } = arcjetModule;

  // Initialize Arcjet with rules
  return arcjet({
    key: process.env.ARCJET_KEY,
    rules: [
      shield({
        mode: "LIVE",
      }),
      detectBot({
        mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
        allow: [
          "CATEGORY:SEARCH_ENGINE", // Allows Google, Bing, etc.
          "GO_HTTP", // For Inngest
        ],
      }),
    ],
  });
})();

module.exports = protectArcjet;
