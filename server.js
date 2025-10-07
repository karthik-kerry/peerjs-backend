// backend/server.js
import express from "express";
import { PeerServer } from "peer";
import cors from "cors";

const app = express();
app.use(cors());
app.get("/", (req, res) => res.send("PeerJS signaling server is running"));

// Create PeerJS server on same Express instance
const peerServer = PeerServer({
  port: 9000,
  path: "/myapp",
  allow_discovery: true,
});

app.listen(8000, () => {
  console.log("🌐 Express running on http://localhost:8000");
});
console.log("✅ PeerJS server running on ws://localhost:9000/myapp");
