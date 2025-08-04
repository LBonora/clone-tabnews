import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";

const uniqueUser = {
  username: "uniqueUser",
  email: "unique@test.com",
  password: "uniquePassword",
};

beforeAll(cleanDatabase);
async function cleanDatabase() {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.createUser(uniqueUser);
}

describe("GET api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("with exact case match", async () => {
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${uniqueUser.username}`,
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: uniqueUser.username,
        email: uniqueUser.email,
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
        `http://localhost:3000/api/v1/users/${uniqueUser.username.toUpperCase()}`,
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: uniqueUser.username,
        email: uniqueUser.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toEqual(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("with nonexistent username", async () => {
      const response = await fetch(
        `http://localhost:3000/api/v1/users/inexistente`,
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
