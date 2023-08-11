import { parseBody } from "./test-utils/test-utils";
import {
  createTestClient,
  type LangfuseCoreTestClient,
  type LangfuseCoreTestClientMocks,
} from "./test-utils/LangfuseCoreTestClient";

describe("Langfuse Core", () => {
  let langfuse: LangfuseCoreTestClient;
  let mocks: LangfuseCoreTestClientMocks;

  jest.useFakeTimers();

  beforeEach(() => {
    delete process.env.LANGFUSE_RELEASE;
    [langfuse, mocks] = createTestClient({
      publicKey: "pk-lf-111",
      secretKey: "sk-lf-111",
      flushAt: 1,
    });
  });

  describe("traces", () => {
    it("should create a trace", async () => {
      jest.setSystemTime(new Date("2022-01-01"));

      langfuse.trace({
        name: "test-trace",
      });

      expect(mocks.fetch).toHaveBeenCalledTimes(1);
      const [url, options] = mocks.fetch.mock.calls[0];
      expect(url).toMatch(/^https:\/\/cloud\.langfuse\.com\/api\/public\/traces$/);
      expect(options.method).toBe("POST");
      const body = parseBody(mocks.fetch.mock.calls[0]);

      expect(body).toMatchObject({
        name: "test-trace",
      });
    });

    it("should allow overridding the id", async () => {
      langfuse.trace({
        id: "123456789",
      });

      const body = parseBody(mocks.fetch.mock.calls[0]);

      expect(body).toEqual({
        id: "123456789",
      });
    });

    it("test all params", async () => {
      jest.setSystemTime(new Date("2022-01-01"));

      langfuse.trace({
        name: "test-trace",
        id: "123456789",
        metadata: {
          test: "test",
          mira: {
            hello: "world",
          },
        },
        version: "1.0.0",
      });

      expect(mocks.fetch).toHaveBeenCalledTimes(1);
      const body = parseBody(mocks.fetch.mock.calls[0]);
      expect(body).toMatchObject({
        name: "test-trace",
        id: "123456789",
        metadata: {
          test: "test",
          mira: {
            hello: "world",
          },
        },
        version: "1.0.0",
      });
    });
  });

  describe("trace release", () => {
    it("should add env LANGFUSE_RELEASE as release to trace", async () => {
      process.env.LANGFUSE_RELEASE = "v1.0.0-alpha.1";
      [langfuse, mocks] = createTestClient({
        publicKey: "pk-lf-111",
        secretKey: "sk-lf-111",
        flushAt: 1,
      });

      langfuse.trace({
        name: "test-trace",
      });

      const body = parseBody(mocks.fetch.mock.calls[0]);

      expect(body).toMatchObject({
        release: "v1.0.0-alpha.1",
      });
    });

    it("should add release to trace if set in constructor", async () => {
      [langfuse, mocks] = createTestClient({
        publicKey: "pk-lf-111",
        secretKey: "sk-lf-111",
        flushAt: 1,
        release: "v2",
      });

      langfuse.trace({
        name: "test-trace",
      });

      const body = parseBody(mocks.fetch.mock.calls[0]);

      expect(body).toMatchObject({
        release: "v2",
      });
    });

    it("should add release to trace if set in trace", async () => {
      langfuse.trace({
        name: "test-trace",
        release: "v5",
      });

      const body = parseBody(mocks.fetch.mock.calls[0]);

      expect(body).toMatchObject({
        release: "v5",
      });
    });

    it("should not add release to trace if not set", async () => {
      langfuse.trace({
        name: "test-trace",
      });
      const body = parseBody(mocks.fetch.mock.calls[0]);
      expect(body).not.toHaveProperty("release");
    });

    it("should allow overridding the release in constructor", async () => {
      process.env.LANGFUSE_RELEASE = "v1";
      [langfuse, mocks] = createTestClient({
        publicKey: "pk-lf-111",
        secretKey: "sk-lf-111",
        flushAt: 1,
        release: "v4",
      });

      langfuse.trace({
        name: "test-trace",
      });

      const body = parseBody(mocks.fetch.mock.calls[0]);

      expect(body).toMatchObject({
        release: "v4",
      });
    });

    it("should allow overridding the release in trace", async () => {
      process.env.LANGFUSE_RELEASE = "v1";
      [langfuse, mocks] = createTestClient({
        publicKey: "pk-lf-111",
        secretKey: "sk-lf-111",
        flushAt: 1,
        release: "v2",
      });

      langfuse.trace({
        name: "test-trace",
        release: "v3",
      });

      const body = parseBody(mocks.fetch.mock.calls[0]);

      expect(body).toMatchObject({
        release: "v3",
      });
    });
  });
});
