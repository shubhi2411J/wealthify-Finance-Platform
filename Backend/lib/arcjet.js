const dotenv = require("dotenv");
dotenv.config();

const arcjetInit = (async () => {
  const arcjetModule = await import("@arcjet/node");
  const arcjet = arcjetModule.default;
  const { tokenBucket } = arcjetModule;

  const aj = arcjet({
    key: process.env.ARCJET_KEY,
    characteristics: ["userId"],
    rules: [
      tokenBucket({
        mode: "LIVE",
        refillRate: 3,
        interval: 3600,
        capacity: 3,
      }),
    ],
  });

  return aj; // Return the initialized Arcjet instance
})();

module.exports = arcjetInit; // Export the promise
