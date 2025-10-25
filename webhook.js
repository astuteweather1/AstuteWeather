import express from "express";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 3000;

// Để nhận JSON từ GitHub
app.use(express.json());

// Webhook secret bạn cài trong GitHub App
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "your_secret_here";

// Hàm kiểm tra chữ ký HMAC
function verifySignature(req) {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return false;

  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Route nhận webhook
app.post("/webhook", (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).send("Invalid signature");
  }

  const event = req.headers["x-github-event"];
  console.log("Received GitHub event:", event);
  console.log("Payload:", req.body);

  // TODO: xử lý deploy, build, update dữ liệu thời tiết,...
  
  res.status(200).send("Webhook received");
});

app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
