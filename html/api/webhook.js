import crypto from "crypto";

// Vercel serverless config để nhận raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "myAstuteSecret123";

  // Đọc raw body
  const buf = await new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return res.status(401).send("Missing signature");

  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(buf).digest("hex");

  const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  if (!isValid) return res.status(401).send("Invalid signature");

  const payload = JSON.parse(buf.toString());
  const event = req.headers["x-github-event"];
  console.log("GitHub event:", event);
  console.log("Payload:", payload);

  res.status(200).json({ message: "Webhook received" });
}
