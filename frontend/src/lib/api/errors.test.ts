import { describe, expect, it } from "vitest";
import { ApiClientError, parseApiErrorBody } from "./errors";

describe("parseApiErrorBody", () => {
  it("parses a valid API error payload", () => {
    expect(
      parseApiErrorBody({
        code: "INVALID_ARGUMENT",
        message: "bad",
        requestId: "req-1",
      }),
    ).toEqual({
      code: "INVALID_ARGUMENT",
      message: "bad",
      requestId: "req-1",
    });
  });

  it("rejects malformed payloads", () => {
    expect(parseApiErrorBody({ code: "X" })).toBeNull();
  });
});

describe("ApiClientError", () => {
  it("exposes structured fields", () => {
    const error = new ApiClientError(400, {
      code: "INVALID_ARGUMENT",
      message: "invalid",
      requestId: "req-2",
    });

    expect(error.status).toBe(400);
    expect(error.code).toBe("INVALID_ARGUMENT");
    expect(error.requestId).toBe("req-2");
  });
});
