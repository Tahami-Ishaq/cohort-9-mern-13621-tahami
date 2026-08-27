import request from "supertest";
import { expect } from "chai";
import app from "../src/app.js";

describe("Authentication API", () => {

    describe("POST /api/v1/auth/register", () => {

        it("should register a new user", async () => {

            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    name: "Test User",
                    email: `test${Date.now()}@example.com`,
                    password: "Password123"
                });

            console.log("REGISTER RESPONSE:", response.status);
            console.log("REGISTER BODY:", response.body);

            expect(response.status).to.equal(201);
        });

    });

    describe("POST /api/v1/auth/login", () => {

        it("should login with valid credentials", async () => {

            const email = `login${Date.now()}@example.com`;
            const password = "Password123";

            await request(app)
                .post("/api/v1/auth/register")
                .send({
                    name: "Login User",
                    email,
                    password
                });

            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email,
                    password
                });

            console.log("LOGIN RESPONSE:", response.status);
            console.log("LOGIN BODY:", response.body);

            expect(response.status).to.equal(200);
        });

    });

    describe("GET /api/v1/auth/me", () => {

    it("should return the authenticated user's profile", async () => {
        const email = `profile${Date.now()}@example.com`;
        const password = "Password123";

        await request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "Profile User",
                email,
                password,
            });

        const loginResponse = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email,
                password,
            });

        expect(loginResponse.status).to.equal(200);

        const token = loginResponse.body.data.token;

        const response = await request(app)
            .get("/api/v1/auth/me")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
        expect(response.body.data.email).to.equal(email);
        expect(response.body.data.name).to.equal("Profile User");
    });

    it("should return 401 without authentication token", async () => {
        const response = await request(app)
            .get("/api/v1/auth/me");

        expect(response.status).to.equal(401);
        expect(response.body.success).to.equal(false);
    });

});
});