import request from "supertest";
import { expect } from "chai";
import app from "../src/app.js";
import { withTestContext } from "./testUtils.js";

describe("Authentication API", () => {

    describe("POST /api/v1/auth/register", () => {

        it("should register a new user", async () => {

            const response = await withTestContext(request(app)
                .post("/api/v1/auth/register")
                .send({
                    name: "Test User",
                    email: `test${Date.now()}@example.com`,
                    password: "Password123"
                }), "registration request");

            expect(response.status).to.equal(201);
        });

    });

    describe("POST /api/v1/auth/login", () => {

        it("should login with valid credentials", async () => {

            const email = `login${Date.now()}@example.com`;
            const password = "Password123";

            await withTestContext(request(app)
                .post("/api/v1/auth/register")
                .send({
                    name: "Login User",
                    email,
                    password
                }), "login test registration request");

            const response = await withTestContext(request(app)
                .post("/api/v1/auth/login")
                .send({
                    email,
                    password
                }), "login request");

            expect(response.status).to.equal(200);
        });

    });

    describe("GET /api/v1/auth/me", () => {

    it("should return the authenticated user's profile", async () => {
        const email = `profile${Date.now()}@example.com`;
        const password = "Password123";

        await withTestContext(request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "Profile User",
                email,
                password,
            }), "profile test registration request");

        const loginResponse = await withTestContext(request(app)
            .post("/api/v1/auth/login")
            .send({
                email,
                password,
            }), "profile test login request");

        expect(loginResponse.status).to.equal(200);

        const token = loginResponse.body.data.token;

        const response = await withTestContext(request(app)
            .get("/api/v1/auth/me")
            .set("Authorization", `Bearer ${token}`), "profile request");

        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
        expect(response.body.data.email).to.equal(email);
        expect(response.body.data.name).to.equal("Profile User");
    });

    it("should return 401 without authentication token", async () => {
        const response = await withTestContext(
            request(app).get("/api/v1/auth/me"),
            "unauthenticated profile request"
        );

        expect(response.status).to.equal(401);
        expect(response.body.success).to.equal(false);
    });

});
});