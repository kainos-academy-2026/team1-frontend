import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../src/app";

describe("GET /", () => {
    it("renders the home page", async () => {
        const response = await request(app).get("/");

        expect(response.status).toBe(200);
        expect(response.text).toContain("Hello World");
    });
});
