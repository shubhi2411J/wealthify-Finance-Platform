const multer = require("multer");

// Store file in memory (RAM) instead of disk
const storage = multer.memoryStorage(); 

const upload = multer({ storage: storage });

module.exports = upload;
