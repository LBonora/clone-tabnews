import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";
import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";

const testUser = {
  username: "testUser",
  email: "correct@test.com",
  password: "senha-correta",
};

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  const createdUser = await orchestrator.createUser(testUser);
  testUser.id = createdUser.id;
  //Object.assign(testUser, createdUser);
});

describe("POST api/v1/users", () => {
  describe("Anonymous user", () => {
    test("with incorrect `email` but correct `password`", async () => {
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "wrong@test.com",
          password: testUser.password,
        }),
      });
      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem",
        action: "Verifique se os dados enviados estão corretos;",
        status_code: 401,
      });
    });

    test("with correct `email` but incorrect `password`", async () => {
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: "senha-errada",
        }),
      });
      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem",
        action: "Verifique se os dados enviados estão corretos;",
        status_code: 401,
      });
    });

    test("with incorrect `email` and incorrect `password`", async () => {
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "wrong@email.com",
          password: "senha-errada",
        }),
      });
      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem",
        action: "Verifique se os dados enviados estão corretos;",
        status_code: 401,
      });
    });

    test("with correct `email` and correct `password`", async () => {
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });
      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({ ...responseBody, user_id: testUser.id });
      expect(uuidVersion(responseBody.id)).toEqual(4);
      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const expiresAt = new Date(responseBody.expires_at);
      const createdAt = new Date(responseBody.created_at);
      expect(expiresAt - createdAt).toEqual(session.EXPIRATION_IN_MILISECS);

      const parsedSetCookie = setCookieParser(response, { map: true });
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: responseBody.token,
        maxAge: session.EXPIRATION_IN_MILISECS / 1000,
        path: "/",
        httpOnly: true,
      });
    });
  });
});
