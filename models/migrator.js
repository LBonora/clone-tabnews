import { resolve } from "node:path";
import migrationRunner from "node-pg-migrate";

import database from "infra/database.js";
import { ServiceError } from "infra/errors.js";

async function runMigrations({ dryRun } = { dryRun: true }) {
  const dbClient = await database.getNewClient();
  try {
    return await migrationRunner({
      dbClient,
      dryRun,
      dir: resolve("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    });
  } catch (error) {
    throw new ServiceError({ message: "Falha nas migrations", cause: error });
  } finally {
    await dbClient?.end();
  }
}

const migrator = { runMigrations };
export default migrator;
