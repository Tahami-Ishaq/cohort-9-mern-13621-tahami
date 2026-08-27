import request from "supertest";
import { expect } from "chai";
import app from "../src/app.js";

describe("Notes API", () => {
    let token;
    let noteId;

    const email = `notes${Date.now()}@example.com`;
    const password = "Password123";

    // Create test user and get authentication token
    before(async () => {
        const registerResponse = await request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "Notes Test User",
                email,
                password,
            });

        expect(registerResponse.status).to.equal(201);

        const loginResponse = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email,
                password,
            });

        expect(loginResponse.status).to.equal(200);

        token = loginResponse.body.data.token;
    });

    // =========================
    // CREATE NOTE
    // =========================

    describe("POST /api/v1/notes", () => {
        it("should create a new note", async () => {
            const response = await request(app)
                .post("/api/v1/notes")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Test Note",
                    content: "This is a test note.",
                });

            expect(response.status).to.equal(201);
            expect(response.body.success).to.equal(true);
            expect(response.body.message).to.equal(
                "Note created successfully"
            );

            expect(response.body.data).to.exist;

            expect(response.body.data.title).to.equal("Test Note");
            expect(response.body.data.content).to.equal(
                "This is a test note."
            );

            // Save note ID for next tests
            noteId = response.body.data.id;
        });
    });

    // =========================
    // GET ALL NOTES
    // =========================

    describe("GET /api/v1/notes", () => {
        it("should return user's notes", async () => {
            const response = await request(app)
                .get("/api/v1/notes")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);

            expect(response.body.data).to.be.an("array");

            expect(response.body.data.length).to.be.greaterThan(0);
        });
    });

    // =========================
    // GET SINGLE NOTE
    // =========================

    describe("GET /api/v1/notes/:id", () => {
        it("should return a single note", async () => {
            const response = await request(app)
                .get(`/api/v1/notes/${noteId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);

            expect(response.body.data).to.exist;

            expect(response.body.data.id).to.equal(noteId);
            expect(response.body.data.title).to.equal("Test Note");
            expect(response.body.data.content).to.equal(
                "This is a test note."
            );
        });
    });

    // =========================
    // UPDATE NOTE
    // =========================

    describe("PUT /api/v1/notes/:id", () => {
        it("should update the note", async () => {
            const response = await request(app)
                .put(`/api/v1/notes/${noteId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Updated Test Note",
                    content: "This content has been updated.",
                });

            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);

            expect(response.body.message).to.equal(
                "Note updated successfully"
            );

            expect(response.body.data).to.exist;

            expect(response.body.data.id).to.equal(noteId);
            expect(response.body.data.title).to.equal(
                "Updated Test Note"
            );
            expect(response.body.data.content).to.equal(
                "This content has been updated."
            );
        });
    });

    // =========================
    // DELETE NOTE
    // =========================

    describe("DELETE /api/v1/notes/:id", () => {
        it("should delete the note", async () => {
            const response = await request(app)
                .delete(`/api/v1/notes/${noteId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);

            expect(response.body.message).to.equal(
                "Note deleted successfully"
            );
        });
    });

    // =========================
    // PROTECTED ROUTES
    // =========================

    describe("Authentication", () => {
        it("should reject requests without a token", async () => {
            const response = await request(app)
                .get("/api/v1/notes");

            expect(response.status).to.equal(401);
            expect(response.body.success).to.equal(false);
            expect(response.body.message).to.equal(
                "Authentication token is required"
            );
        });

        it("should reject an invalid JWT", async () => {
            const response = await request(app)
                .get("/api/v1/notes")
                .set("Authorization", "Bearer invalid-token");

            expect(response.status).to.equal(401);
            expect(response.body.success).to.equal(false);
            expect(response.body.message).to.equal("Invalid or expired token");
        });

        it("should reject a malformed JWT", async () => {
            const response = await request(app)
                .get("/api/v1/notes")
                .set("Authorization", "Bearer not.a.jwt");

            expect(response.status).to.equal(401);
            expect(response.body.success).to.equal(false);
            expect(response.body.message).to.equal("Invalid or expired token");
        });
    });

    describe("Validation", () => {
        it("should reject creating a note without title or content", async () => {
            const response = await request(app)
                .post("/api/v1/notes")
                .set("Authorization", `Bearer ${token}`)
                .send({});

            expect(response.status).to.equal(400);
            expect(response.body.success).to.equal(false);
            expect(response.body.message).to.equal(
                "Title and content are required"
            );
        });

        it("should reject updating a note without title or content", async () => {
            const response = await request(app)
                .put(`/api/v1/notes/${noteId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({});

            expect(response.status).to.equal(400);
            expect(response.body.success).to.equal(false);
            expect(response.body.message).to.equal(
                "Title and content are required"
            );
        });

        it("should return 404 for a non-existing note", async () => {
            const response = await request(app)
                .get("/api/v1/notes/999999999")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).to.equal(404);
            expect(response.body.success).to.equal(false);
            expect(response.body.message).to.equal("Note not found");
        });
    });

    describe("Authentication validation", () => {
        it("should reject invalid login credentials", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email,
                    password: "WrongPassword123",
                });

            expect(response.status).to.equal(401);
            expect(response.body.success).to.equal(false);
            expect(response.body.message).to.equal("Invalid email or password");
        });

        it("should reject duplicate registration", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    name: "Duplicate Notes Test User",
                    email,
                    password,
                });

            expect(response.status).to.equal(409);
            expect(response.body.success).to.equal(false);
            expect(response.body.message).to.equal("Email is already registered");
        });

        it("should reject a password longer than 72 bytes", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    name: "Long Password User",
                    email: `long-password${Date.now()}@example.com`,
                    password: "a".repeat(73),
                });

            expect(response.status).to.equal(400);
            expect(response.body.success).to.equal(false);
            expect(response.body.message).to.equal(
                "Password must not exceed 72 bytes"
            );
        });
    });

    describe("Authorization", () => {
    let userBToken;
    let userBNoteId;

    before(async () => {
        const email = `userb${Date.now()}@example.com`;
        const password = "Password123";

        // Create User B
        const registerResponse = await request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "User B",
                email,
                password,
            });

        expect(registerResponse.status).to.equal(201);

        // Login User B
        const loginResponse = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email,
                password,
            });

        expect(loginResponse.status).to.equal(200);

        userBToken = loginResponse.body.data.token;

        // Create User B's note
        const noteResponse = await request(app)
            .post("/api/v1/notes")
            .set("Authorization", `Bearer ${userBToken}`)
            .send({
                title: "User B Note",
                content: "This belongs to User B.",
            });

        expect(noteResponse.status).to.equal(201);

        userBNoteId = noteResponse.body.data.id;
    });

    it("should not allow User A to access User B's note", async () => {
        const response = await request(app)
            .get(`/api/v1/notes/${userBNoteId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).to.equal(404);
        expect(response.body.success).to.equal(false);
        expect(response.body.message).to.equal("Note not found");
    });

    it("should not allow User A to update User B's note", async () => {
        const response = await request(app)
            .put(`/api/v1/notes/${userBNoteId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Hacked Note",
                content: "User A should not be able to update this.",
            });

        expect(response.status).to.equal(404);
        expect(response.body.success).to.equal(false);
        expect(response.body.message).to.equal("Note not found");
    });

    it("should not allow User A to delete User B's note", async () => {
        const response = await request(app)
            .delete(`/api/v1/notes/${userBNoteId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).to.equal(404);
        expect(response.body.success).to.equal(false);
        expect(response.body.message).to.equal("Note not found");
    });
});

});