import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

test("Not allowed methods to api/v1/migrations should return 405", async () => {
  const notAllowedMethods = ["PUT", "DELETE", "PATCH"];
  for (const method of notAllowedMethods) {
    let response = await fetch("http://localhost:3000/api/v1/migrations", {
      method: method,
    });
    expect(response.status).toBe(405);
  }
});
