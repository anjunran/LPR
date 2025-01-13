const express = require("express");
const fs = require("fs");
const path = require("path");

const filterRouter = express.Router();
const presetsFilePath = path.join(__dirname, "../assets/filterPresets.json");

// Utility function to read the JSON file
const readPresetsFile = () => {
  try {
    const data = fs.readFileSync(presetsFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading the presets file:", error);
    return [];
  }
};

// ✅ GET endpoint to read all presets
filterRouter.get("/presets", (req, res) => {
  const presets = readPresetsFile();
  res.json(presets);
});

// Placeholder for POST endpoint
filterRouter.post("/presets", (req, res) => {
  res.status(501).json({ message: "POST endpoint is not implemented yet." });
});

// Placeholder for PUT endpoint
filterRouter.put("/presets/:name", (req, res) => {
  res.status(501).json({ message: "PUT endpoint is not implemented yet." });
});

// Placeholder for DELETE endpoint
filterRouter.delete("/presets/:name", (req, res) => {
  res.status(501).json({ message: "DELETE endpoint is not implemented yet." });
});

module.exports = filterRouter;
