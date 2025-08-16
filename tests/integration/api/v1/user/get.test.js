import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";
import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";

const uniqueUser = {
  username: "uniqueUser",
  email: "unique@test.com",
  password: "uniquePassword",
};

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.createUser(uniqueUser);
});

describe("GET api/v1/user", () => {
  describe("Default user", () => {
    test("with valid session", async () => {
      const sessionObject = await orchestrator.createSession(uniqueUser.id);
      const response = await fetch(`http://localhost:3000/api/v1/user`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(200);

      const cacheControl = response.headers.get("Cache-Control");
      expect(cacheControl).toBe(
        "no-store, no-cache, max-age=0, must-revalidate",
      );

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: uniqueUser.id,
        username: uniqueUser.username,
        email: uniqueUser.email,
        password: uniqueUser.password,
        created_at: uniqueUser.created_at.toISOString(),
        updated_at: uniqueUser.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toEqual(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      // Session renewal assertions
      const renewdSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(renewdSessionObject.expires_at > sessionObject.expires_at).toEqual(
        true,
      );
      expect(renewdSessionObject.updated_at > sessionObject.updated_at).toEqual(
        true,
      );

      // Set-Cookie assertions
      const parsedSetCookie = setCookieParser(response, { map: true });
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILISECS / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    test("with nonexistent session", async () => {
      const invalidToken =
        "599065e239b9ad14b7d1e39da84ad167032c883ac6709fbd8b24f28efb1fc076bc2846845682f0e2c8683b1b5b842e06";
      const response = await fetch(`http://localhost:3000/api/v1/user`, {
        headers: {
          Cookie: `session_id=${invalidToken}`,
        },
      });
      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa",
        action: "Verifique se este usuário está logado e tente novamente",
        status_code: 401,
      });
    });

    test("with expired session", async () => {
      // jest.useFakeTimers({
      //   now: new Date(Date.now() - session.EXPIRATION_IN_MILISECS),
      // });

      const sessionObject = await orchestrator.createSession(uniqueUser.id);

      // jest.userRealTimers();

      const response = await fetch(`http://localhost:3000/api/v1/user`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: uniqueUser.id,
        username: uniqueUser.username,
        email: uniqueUser.email,
        password: uniqueUser.password,
        created_at: uniqueUser.created_at.toISOString(),
        updated_at: uniqueUser.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toEqual(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });
  });
});
