import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("Not allowed methods api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Trying bad requests", () => {
      const notAllowedMethods = ["PUT", "PATCH", "DELETE"];
      for (const method of notAllowedMethods) {
        test(`${method} attempt`, async () => {
          const response = await fetch(
            "http://localhost:3000/api/v1/migrations",
            {
              method: method,
            },
          );
          expect(response.status).toBe(405);
          const responseBody = await response.json();
          expect(responseBody).toEqual({
            message: "Método não permitido para este endpoint.",
            name: "MethodNotAllowedError",
            action:
              "Verifique se o método HTTP enviado é válido para esse endpoint.",
            status_code: 405,
          });
        });
      }
    });
  });
});
