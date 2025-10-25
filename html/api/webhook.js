import crypto from "crypto";

// Vercel config: tắt bodyParser để nhận raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Chỉ chấp nhận POST
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "myAstuteSecret123";

  // Đọc raw body
  const buf = await new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

  // Kiểm tra signature
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return res.status(401).send("Missing signature");

  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(buf).digest("hex");

  const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  if (!isValid) return res.status(401).send("Invalid signature");

  // Parse payload JSON
  const payload = JSON.parse(buf.toString());
  const event = req.headers["x-github-event"];

  console.log("==== GitHub Webhook Received ====");
  console.log("Event:", event);
  console.log("Payload:", payload);
  console.log("================================");

  // TODO: Xử lý tự động update dữ liệu 63 tỉnh
  if (event === "push") {
    console.log("Push detected! Bạn có thể rebuild dữ liệu thời tiết ở đây.");
  }

  res.status(200).json({ message: "Webhook received successfully" });
}
