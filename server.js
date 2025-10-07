import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { PeerServer } from "peer";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MONGO_URI =
  "mongodb+srv://karthiksriram682_db_user:lo9zSn551mf4NiBX@cluster0.gdmrs41.mongodb.net/peerchat?retryWrites=true&w=majority&tls=true";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ---------- MODELS ----------
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: String,
    peerId: String,
    createdAt: { type: Date, default: Date.now },
  })
);

const Message = mongoose.model(
  "Message",
  new mongoose.Schema({
    senderId: String,
    receiverId: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
  })
);

// ---------- ROUTES ----------
app.post("/api/register", async (req, res) => {
  try {
    const { name, peerId } = req.body;
    if (!name || !peerId) return res.status(400).send("Missing data");

    const user = await User.findOneAndUpdate(
      { peerId },
      { name },
      { upsert: true, new: true }
    );

    res.json(user);
  } catch (err) {
    console.error("Register user error:", err);
    res.status(500).send("Internal server error");
  }
});

app.post("/api/message", async (req, res) => {
  const { senderId, receiverId, message } = req.body;
  if (!senderId || !receiverId || !message)
    return res.status(400).send("Missing data");

  const msg = await Message.create({ senderId, receiverId, message });
  res.json(msg);
});

app.get("/api/messages/:peerA/:peerB", async (req, res) => {
  const { peerA, peerB } = req.params;
  const history = await Message.find({
    $or: [
      { senderId: peerA, receiverId: peerB },
      { senderId: peerB, receiverId: peerA },
    ],
  }).sort({ timestamp: 1 });

  res.json(history);
});

app.get("/", (_, res) => res.send("PeerJS signaling + chat backend running!"));

// ---------- PEER SERVER ----------
const peerServer = PeerServer({
  port: 9001, // changed port
  path: "/myapp",
  allow_discovery: true,
});
console.log("✅ PeerJS server running on ws://localhost:9001/myapp");

app.listen(8000, () =>
  console.log("🌐 Express running on http://localhost:8000")
);
