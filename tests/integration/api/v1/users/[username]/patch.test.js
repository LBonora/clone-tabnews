import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import user from "models/user.js";
import password from "models/password";

beforeAll(cleanDatabase);
async function cleanDatabase() {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
}

describe("PATCH api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    const uniqueUser = {
      username: "uniqueTester",
      email: "unique@test.com",
      password: "validPassword",
    };

    const guineaPig = {
      username: "differentUser",
      email: "another@test.com",
      password: "validPassword",
    };

    test("set up", async () => {
      const testerResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(uniqueUser),
      });
      expect(testerResponse.status).toBe(201);

      const extraResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guineaPig),
      });
      expect(extraResponse.status).toBe(201);
    });

    test("with nonexistent 'username'", async () => {
      const response = await fetch(
        `http://localhost:3000/api/v1/users/inexistente`,
        {
          method: "PATCH",
        },
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

    test("with duplicated 'username'", async () => {
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${guineaPig.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: uniqueUser.username,
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está em uso.",
        action: "Utilize outro username para realizar esta operação.",
        status_code: 400,
      });
    });

    test("with duplicated 'email'", async () => {
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${guineaPig.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: uniqueUser.email,
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está em uso.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    test("with empty data", async () => {
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${uniqueUser.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );
      expect(response.status).toBe(400);
    });

    test("with unique 'username'", async () => {
      const newUsername = "newUniqueTester";
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${uniqueUser.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: newUsername,
          }),
        },
      );
      expect(response.status).toBe(200);
      uniqueUser.username = newUsername;

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
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("with unique 'email'", async () => {
      const newEmail = "new.unique@test.com";
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${uniqueUser.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: newEmail,
          }),
        },
      );
      expect(response.status).toBe(200);
      uniqueUser.email = newEmail;

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
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("with new 'password'", async () => {
      const newPassword = "newPassword";
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${uniqueUser.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: newPassword,
          }),
        },
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
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(uniqueUser.username);
      const correctPasswordMatch = await password.compare(
        newPassword,
        userInDatabase.password,
      );
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await password.compare(
        uniqueUser.password,
        userInDatabase.password,
      );
      expect(incorrectPasswordMatch).toBe(false);
      uniqueUser.password = newPassword;
    });
  });
});
