// @ts-check

import request from "supertest";
import { expect } from "chai";
import app from "../src/app.js";
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