import { describe, expect, it } from "vitest";
import app from "../index";

describe("Hono App", () => {
	it("should return Hello Hono! on GET /", async () => {
		const req = new Request("http://localhost/");
		const res = await app.request(req);
		expect(res.status).toBe(200);
		expect(await res.text()).toBe("Hello Hono!");
	});
});
