import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";

const uniqueUser = {
  username: "uniqueUser",
  email: "unique@test.com",
  password: "uniquePassword",
};

const mutableAssistant = {
  username: "mutableAssistant",
  email: "mutable@assist.com",
  password: "mutablePassword",
};

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.createUser(uniqueUser);
  await orchestrator.createUser(mutableAssistant);
});

describe("PATCH api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
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
        `http://localhost:3000/api/v1/users/${mutableAssistant.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: uniqueUser.username }),
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
        `http://localhost:3000/api/v1/users/${mutableAssistant.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: uniqueUser.email }),
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
        `http://localhost:3000/api/v1/users/${mutableAssistant.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );
      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Alterações nos dados não foram informadas.",
        action: "Informe possíveis alterações nos campos válidos.",
        status_code: 400,
      });
    });

    test("with unique 'username'", async () => {
      const username = "mutatedHelper";
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${mutableAssistant.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        },
      );
      expect(response.status).toBe(200);
      mutableAssistant.username = username;

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: mutableAssistant.username,
        email: mutableAssistant.email,
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
      const email = "new.email@test.com";
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${mutableAssistant.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      expect(response.status).toBe(200);
      mutableAssistant.email = email;

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: mutableAssistant.username,
        email: mutableAssistant.email,
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
      const password = "newPassword";
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${mutableAssistant.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: mutableAssistant.username,
        email: mutableAssistant.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toEqual(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const correctPasswordMatch = await orchestrator.checkPassword(
        mutableAssistant.username,
        password,
      );
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await orchestrator.checkPassword(
        mutableAssistant.username,
        mutableAssistant.password,
      );
      expect(incorrectPasswordMatch).toBe(false);

      mutableAssistant.password = password;
    });

    test("with a lot of changes", async () => {
      const username = mutableAssistant.username.toUpperCase();
      const email = "";
      const newPassword = "AnOtHeRpAss";
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${mutableAssistant.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            email,
            password: newPassword,
          }),
        },
      );
      expect(response.status).toBe(200);
      mutableAssistant.username = username;
      mutableAssistant.email = email;

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: mutableAssistant.username,
        email: mutableAssistant.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toEqual(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const correctPasswordMatch = await orchestrator.checkPassword(
        mutableAssistant.username,
        newPassword,
      );
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await orchestrator.checkPassword(
        mutableAssistant.username,
        mutableAssistant.password,
      );
      expect(incorrectPasswordMatch).toBe(false);

      mutableAssistant.password = newPassword;
    });
  });
});
