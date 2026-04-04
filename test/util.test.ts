import { test, expect } from "bun:test";
import { snakeToCamel, camelToSnake, transformKeys } from "../src/util.js";

test("snakeToCamel converts snake_case to camelCase", () => {
  expect(snakeToCamel("hello_world")).toBe("helloWorld");
  expect(snakeToCamel("is_from_me")).toBe("isFromMe");
  expect(snakeToCamel("id")).toBe("id");
  expect(snakeToCamel("last_message_at")).toBe("lastMessageAt");
  expect(snakeToCamel("request_id")).toBe("requestId");
});

test("camelToSnake converts camelCase to snake_case", () => {
  expect(camelToSnake("helloWorld")).toBe("hello_world");
  expect(camelToSnake("isFromMe")).toBe("is_from_me");
  expect(camelToSnake("id")).toBe("id");
  expect(camelToSnake("lastMessageAt")).toBe("last_message_at");
  expect(camelToSnake("requestId")).toBe("request_id");
});

test("transformKeys recursively transforms object keys", () => {
  const input = {
    line_id: "ln_123",
    is_active: true,
    nested: { last_message_at: 123 },
    items: [{ chat_id: "cht_1" }],
  };
  const result = transformKeys(input, snakeToCamel) as any;
  expect(result).toEqual({
    lineId: "ln_123",
    isActive: true,
    nested: { lastMessageAt: 123 },
    items: [{ chatId: "cht_1" }],
  });
});

test("transformKeys handles null and primitives", () => {
  expect(transformKeys(null, snakeToCamel)).toBe(null);
  expect(transformKeys(undefined, snakeToCamel)).toBe(undefined);
  expect(transformKeys(42, snakeToCamel)).toBe(42);
  expect(transformKeys("hello", snakeToCamel)).toBe("hello");
});
