import retry from "async-retry";
import database from "infra/database.js";
import migrator from "models/migrator.js";
import user from "models/user.js";
import session from "models/session.js";
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
  const newInfo = await user.create({
    username: userObj.username || `user${10}`,
    email: userObj.email || `user${10}@email.com`,
    password: userObj.password || `senhaBatata`,
  });
  return Object.assign(userObj, newInfo);
}

async function createSession(userId) {
  return await session.create(userId);
}

async function checkPassword(username, providedPassword) {
  const userInDatabase = await user.findOneByUsername(username);
  return await password.compare(providedPassword, userInDatabase.password);
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession,
  checkPassword,
};

export default orchestrator;
