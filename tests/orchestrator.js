import retry from "async-retry";
import database from "infra/database.js";
import migrator from "models/migrator.js";
import user from "models/user.js";
import password from "models/password";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 60,
      factor: 1,
      minTimeout: 1 * 1000,
      randomize: false,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");

      if (response.status != 200) {
        throw Error();
      }
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObj) {
  return await user.create({
    username: userObj.username,
    email: userObj.email,
    password: userObj.password,
  });
}

async function checkPassword(username, givenPassword) {
  const userInDatabase = await user.findOneByUsername(username);
  return await password.compare(givenPassword, userInDatabase.password);
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  checkPassword,
};

export default orchestrator;
