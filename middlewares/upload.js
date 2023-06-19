const multer = require("multer");
const path = require("path");

const temporaryFileStorage = path.resolve("temp");

const storage = multer.diskStorage({
  destination: temporaryFileStorage,
  filename: function (req, file, cb) {
    const uniquePreffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const { originalname } = file;
    const fileName = `${uniquePreffix}_${originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
});

module.exports = upload;
