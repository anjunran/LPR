const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const cuiRouter = express.Router({ strict: true });

async function getFilesRecursive(folderPath) {
  let fileList = [];
  try {
    const items = await fs.readdir(folderPath, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(folderPath, item.name);

      if (item.isDirectory()) {
        fileList = fileList.concat(await getFilesRecursive(fullPath));
      } else {
        fileList.push(fullPath);
      }
    }
  } catch (error) {
    console.error("Error reading folder:", error);
  }
  return fileList;
}

const fetch = (pathName) => async (req, res) => {
  try {
    const files = await getFilesRecursive(pathName);
    const fileNames = files.map((file) => path.relative(pathName, file));
    res.json({ files: fileNames });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch files", details: error.message });
  }
};

cuiRouter.get("/files", fetch("./public/components/captureui"));

module.exports = cuiRouter;
