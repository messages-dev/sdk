import { test, expect } from "bun:test";
import { verifyWebhook } from "../src/webhooks.js";
import { SignatureVerificationError } from "../src/errors.js";

const SECRET = "test_secret_123";

async function sign(body: string, timestamp: number, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${body}`));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

test("verifyWebhook verifies valid signature", async () => {
  const timestamp = Date.now();
  const body = JSON.stringify({
    event: "message.received",
    data: { id: "msg_123", text: "hello" },
    timestamp,
  });
  const signature = await sign(body, timestamp, SECRET);
  const event = await verifyWebhook(body, signature, SECRET);
  expect(event.event).toBe("message.received");
  expect(event.data).toEqual({ id: "msg_123", text: "hello" });
  expect(event.timestamp).toBe(timestamp);
});

test("verifyWebhook verifies signature with delivery_id", async () => {
  const timestamp = Date.now();
  const body = JSON.stringify({
    event: "message.sent",
    data: { id: "msg_456" },
    timestamp,
    delivery_id: "dlv_abc123",
  });
  const signature = await sign(body, timestamp, SECRET);
  const event = await verifyWebhook(body, signature, SECRET);
  expect(event.event).toBe("message.sent");
  expect(event.deliveryId).toBe("dlv_abc123");
});

test("verifyWebhook throws on invalid signature", async () => {
  const body = JSON.stringify({
    event: "message.received",
    data: {},
    timestamp: Date.now(),
  });
  await expect(verifyWebhook(body, "invalid_signature", SECRET)).rejects.toThrow(
    SignatureVerificationError,
  );
});

test("verifyWebhook throws on missing signature", async () => {
  const body = JSON.stringify({
    event: "message.received",
    data: {},
    timestamp: Date.now(),
  });
  await expect(verifyWebhook(body, null, SECRET)).rejects.toThrow(
    SignatureVerificationError,
  );
});

test("verifyWebhook throws on tampered body", async () => {
  const timestamp = Date.now();
  const body = JSON.stringify({
    event: "message.received",
    data: { text: "original" },
    timestamp,
  });
  const signature = await sign(body, timestamp, SECRET);
  const tampered = JSON.stringify({
    event: "message.received",
    data: { text: "tampered" },
    timestamp,
  });
  await expect(verifyWebhook(tampered, signature, SECRET)).rejects.toThrow(
    SignatureVerificationError,
  );
});

test("verifyWebhook throws on stale timestamp", async () => {
  const staleTimestamp = Date.now() - 400_000; // 6+ minutes ago
  const body = JSON.stringify({
    event: "message.received",
    data: {},
    timestamp: staleTimestamp,
  });
  const signature = await sign(body, staleTimestamp, SECRET);
  await expect(verifyWebhook(body, signature, SECRET)).rejects.toThrow(
    SignatureVerificationError,
  );
});

test("verifyWebhook accepts custom tolerance", async () => {
  const oldTimestamp = Date.now() - 200_000; // ~3 minutes ago
  const body = JSON.stringify({
    event: "message.received",
    data: {},
    timestamp: oldTimestamp,
  });
  const signature = await sign(body, oldTimestamp, SECRET);
  // Default tolerance (5min) should accept this
  const event = await verifyWebhook(body, signature, SECRET);
  expect(event.event).toBe("message.received");

  // Strict tolerance (1min) should reject
  const strictBody = JSON.stringify({
    event: "message.received",
    data: {},
    timestamp: oldTimestamp,
  });
  const strictSig = await sign(strictBody, oldTimestamp, SECRET);
  await expect(verifyWebhook(strictBody, strictSig, SECRET, { tolerance: 60_000 })).rejects.toThrow(
    SignatureVerificationError,
  );
});
