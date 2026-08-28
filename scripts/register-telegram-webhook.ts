/**
 * Register or inspect Telegram Webhook for PrintOS
 * Usage:
 *   npx tsx scripts/register-telegram-webhook.ts set <PUBLIC_URL> [SECRET_TOKEN]
 *   npx tsx scripts/register-telegram-webhook.ts info
 *   npx tsx scripts/register-telegram-webhook.ts delete
 */

import fs from "fs";
import path from "path";

// Simple .env.local loader without third-party dependencies
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvLocal();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.argv[4];

if (!BOT_TOKEN && process.argv[2] !== "help") {
  console.error("❌ Error: TELEGRAM_BOT_TOKEN is missing from .env.local or arguments.");
  console.error("Please add TELEGRAM_BOT_TOKEN=... to .env.local or pass it as an argument.");
  process.exit(1);
}

const command = process.argv[2] || "info";

async function main() {
  const baseUrl = `https://api.telegram.org/bot${BOT_TOKEN}`;

  if (command === "set") {
    let webhookUrl = process.argv[3];
    const secretToken = process.argv[4] || process.env.TELEGRAM_BOT_SECRET_TOKEN;

    if (!webhookUrl) {
      console.error("❌ Error: Please provide the public URL. Example:");
      console.error("  npx tsx scripts/register-telegram-webhook.ts set https://your-domain.ngrok-free.app");
      process.exit(1);
    }

    if (!webhookUrl.endsWith("/api/webhooks/telegram")) {
      webhookUrl = `${webhookUrl.replace(/\/$/, "")}/api/webhooks/telegram`;
    }

    console.log(`📡 Registering Telegram webhook to: ${webhookUrl}`);

    const payload: { url: string; allowed_updates: string[]; secret_token?: string } = {
      url: webhookUrl,
      allowed_updates: ["message", "callback_query"],
    };

    if (secretToken) {
      payload.secret_token = secretToken;
      console.log("🔒 Secret token configured for signature verification.");
    }

    const res = await fetch(`${baseUrl}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    console.log("\nResponse from Telegram:", JSON.stringify(result, null, 2));

    if (result.ok) {
      console.log("\n✅ Telegram Webhook registered successfully!");
    } else {
      console.error("\n❌ Failed to set webhook:", result.description);
    }
  } else if (command === "info") {
    console.log("🔍 Checking current Telegram Webhook info...");
    const res = await fetch(`${baseUrl}/getWebhookInfo`);
    const result = await res.json();
    console.log("\nTelegram Webhook Info:", JSON.stringify(result, null, 2));
  } else if (command === "delete") {
    console.log("🗑️ Deleting Telegram Webhook...");
    const res = await fetch(`${baseUrl}/deleteWebhook`);
    const result = await res.json();
    console.log("\nTelegram deleteWebhook response:", JSON.stringify(result, null, 2));
  } else {
    console.log("Commands: set <URL> [SECRET], info, delete");
  }
}

main().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});
