const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const xlsx = require("xlsx");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/hospitalDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, default: "user" },
});

const User = mongoose.model("User", userSchema);

// Upload schema
const uploadSchema = new mongoose.Schema({
  filename: String,
  date: { type: Date, default: Date.now },
  uploadedBy: String,
  data: Array,
});

const Upload = mongoose.model("Upload", uploadSchema);

// Multer config
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.status(400).json({ error: "Invalid login" });
  res.json(user);
});

app.post("/upload/:username", upload.single("file"), async (req, res) => {
  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const newUpload = new Upload({
      filename: req.file.originalname,
      uploadedBy: req.params.username,
      data,
    });
    await newUpload.save();

    res.json({ message: "File uploaded and data saved" });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

app.get("/uploads/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (user.role === "admin") {
    const all = await Upload.find();
    res.json(all);
  } else {
    const own = await Upload.find({ uploadedBy: req.params.username });
    res.json(own);
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
