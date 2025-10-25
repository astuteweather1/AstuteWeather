import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send({ message: "Method not allowed" });
  }

  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "myAstuteSecret123";

  // Kiểm tra chữ ký HMAC
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return res.status(401).send("Missing signature");

  const payload = JSON.stringify(req.body);
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(payload).digest("hex");

  const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  if (!isValid) return res.status(401).send("Invalid signature");

  // Nhận payload
  const event = req.headers["x-github-event"];
  console.log("GitHub event:", event);
  console.log("Payload:", req.body);

  // TODO: cập nhật dữ liệu 63 tỉnh + widget thời tiết
  // Ví dụ: rebuild JSON thời tiết hoặc cập nhật cache frontend
  if (event === "push") {
    console.log("Code pushed, bạn có thể cập nhật dữ liệu ngay!");
  }

  res.status(200).json({ message: "Webhook received" });
}
