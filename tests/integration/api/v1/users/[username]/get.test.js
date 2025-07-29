import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";

beforeAll(cleanDatabase);
async function cleanDatabase() {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
}

describe("GET api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    const testUser = {
      username: "uniqueTester",
      email: "unique@test.com",
      password: "validPassword",
    };

    test("with exact case match", async () => {
      const creation = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
      });
      expect(creation.status).toBe(201);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${testUser.username}`,
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: testUser.username,
        email: testUser.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toEqual(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("with mismatch", async () => {
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${testUser.username.toUpperCase()}`,
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: testUser.username,
        email: testUser.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toEqual(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("with nonexistent username", async () => {
      testUser.username = "inexistente";
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${testUser.username}`,
      );
      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema",
        action: "Verifique se o username está digitado corretamente",
        status_code: 404,
      });
    });
  });
});
