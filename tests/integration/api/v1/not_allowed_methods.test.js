import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

const root = "http://localhost:3000/";
const endpoints = {
  "api/v1/status": ["POST", "PUT", "PATCH", "DELETE"],
  "api/v1/migrations": ["PUT", "PATCH", "DELETE"],
};

describe("Not allowed methods to all endpoints", () => {
  for (const [endpoint, notAllowedMethods] of Object.entries(endpoints)) {
    describe("Anonymous user", () => {
      describe(`${endpoint}`, () => {
        for (const method of notAllowedMethods) {
          {
            test(`${method} attempt`, async () => {
              const response = await fetch(root + endpoint, {
                method: method,
              });
              expect(response.status).toBe(405);
              const responseBody = await response.json();
              expect(responseBody.name).toEqual("MethodNotAllowedError");
            });
          }
        }
      });
    });
  }
});
