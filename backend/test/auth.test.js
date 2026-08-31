// @ts-check

import bcrypt from "bcrypt";
import request from "supertest";
import { expect } from "chai";
import app from "../src/app.js";
import { createUser } from "../src/models/userModel.js";
import { withTestContext } from "./testUtils.js";

const mochaGlobals = /** @type {any} */ (globalThis);
/** @type {import("mocha").SuiteFunction} */
const describe = mochaGlobals.describe;
/** @type {import("mocha").TestFunction} */
const it = mochaGlobals.it;

/** @typedef {{name: string, email: string, password: string}} RegistrationPayload */
/** @typedef {{email: string, password: string}} LoginPayload */
/** @typedef {{success: boolean, message?: string, data?: {token?: string, name?: string, email?: string}}} AuthResponseBody */
/** @typedef {{status: number, body: AuthResponseBody}} AuthResponse */

describe("Authentication API", () => {

    describe("POST /api/v1/auth/register", () => {

        it("should register a new user", async () => {
            /** @type {RegistrationPayload} */
            const payload = {
                name: "Test User",
                email: `test${Date.now()}@example.com`,
                password: "Password123"
            };

            /** @type {AuthResponse} */
            const response = await withTestContext(request(app)
                .post("/api/v1/auth/register")
                .send(payload), "registration request");

            expect(response.status).to.equal(201);
        });

        it("should reject invalid email format", async () => {
            /** @type {RegistrationPayload} */
            const payload = {
                name: "Invalid Email User",
                email: "invalid-email",
                password: "Password123"
            };

            /** @type {AuthResponse} */
            const response = await withTestContext(request(app)
                .post("/api/v1/auth/register")
                .send(payload), "invalid email registration request");

            expect(response.status).to.equal(400);
            expect(response.body.success).to.equal(false);
            expect(response.body.message).to.equal("Please enter a valid email address");
        });

        it("should reject passwords shorter than 8 characters", async () => {
            /** @type {RegistrationPayload} */
            const payload = {
                name: "Short Password User",
                email: `shortpass${Date.now()}@example.com`,
                password: "12345"
            };

            /** @type {AuthResponse} */
            const response = await withTestContext(request(app)
                .post("/api/v1/auth/register")
                .send(payload), "short password registration request");

            expect(response.status).to.equal(400);
            expect(response.body.success).to.equal(false);
            expect(response.body.message).to.equal("Password must be at least 8 characters long");
        });

    });

    describe("POST /api/v1/auth/login", () => {

        it("should login with valid credentials", async () => {

            const email = `login${Date.now()}@example.com`;
            const password = "Password123";
            /** @type {RegistrationPayload} */
            const registration = { name: "Login User", email, password };
            /** @type {LoginPayload} */
            const credentials = { email, password };

            await withTestContext(request(app)
                .post("/api/v1/auth/register")
                .send(registration), "login test registration request");

            /** @type {AuthResponse} */
            const response = await withTestContext(request(app)
                .post("/api/v1/auth/login")
                .send(credentials), "login request");

            expect(response.status).to.equal(200);
        });

        it("should allow login for a user whose stored password is shorter than 8 characters", async () => {
            const email = `shortlogin${Date.now()}@example.com`;
            const password = "short";
            const hashedPassword = await bcrypt.hash(password, 10);

            await createUser("Short Login User", email, hashedPassword);

            /** @type {LoginPayload} */
            const credentials = {
                email,
                password,
            };

            /** @type {AuthResponse} */
            const response = await withTestContext(request(app)
                .post("/api/v1/auth/login")
                .send(credentials), "short password login request");

            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            expect(response.body.data?.user?.email).to.equal(email);
        });

        it("should reject login with invalid email format", async () => {
            /** @type {LoginPayload} */
            const credentials = {
                email: "invalid-login-email",
                password: "Password123"
            };

            /** @type {AuthResponse} */
            const response = await withTestContext(request(app)
                .post("/api/v1/auth/login")
                .send(credentials), "invalid email login request");

            expect(response.status).to.equal(400);
            expect(response.body.success).to.equal(false);
            expect(response.body.message).to.equal("Please enter a valid email address");
        });

        it("should normalize password whitespace during registration and login", async () => {
            const email = `trimmed${Date.now()}@example.com`;
            const password = "Password123";

            const registerResponse = await withTestContext(request(app)
                .post("/api/v1/auth/register")
                .send({
                    name: "Trimmed Password User",
                    email,
                    password: `  ${password}  `,
                }), "whitespace registration request");

            expect(registerResponse.status).to.equal(201);

            const loginResponse = await withTestContext(request(app)
                .post("/api/v1/auth/login")
                .send({
                    email,
                    password,
                }), "whitespace login request");

            expect(loginResponse.status).to.equal(200);
            expect(loginResponse.body.success).to.equal(true);
        });

    });

    describe("GET /api/v1/auth/me", () => {

    it("should return the authenticated user's profile", async () => {
        const email = `profile${Date.now()}@example.com`;
        const password = "Password123";
        /** @type {RegistrationPayload} */
        const registration = { name: "Profile User", email, password };
        /** @type {LoginPayload} */
        const credentials = { email, password };

        await withTestContext(request(app)
            .post("/api/v1/auth/register")
            .send(registration), "profile test registration request");

        /** @type {AuthResponse} */
        const loginResponse = await withTestContext(request(app)
            .post("/api/v1/auth/login")
            .send(credentials), "profile test login request");

        expect(loginResponse.status).to.equal(200);

        const token = loginResponse.body.data?.token;
        if (!token) {
            throw new Error("Login response did not contain a token");
        }

        /** @type {AuthResponse} */
        const response = await withTestContext(request(app)
            .get("/api/v1/auth/me")
            .set("Authorization", `Bearer ${token}`), "profile request");

        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
        const profile = response.body.data;
        if (!profile) {
            throw new Error("Profile response did not contain profile data");
        }
        expect(profile.email).to.equal(email);
        expect(profile.name).to.equal("Profile User");
    });

    it("should return 401 without authentication token", async () => {
        /** @type {AuthResponse} */
        const response = await withTestContext(
            request(app).get("/api/v1/auth/me"),
            "unauthenticated profile request"
        );

        expect(response.status).to.equal(401);
        expect(response.body.success).to.equal(false);
    });

});
});