import database from "infra/database";
import { InternalServerError } from "infra/errors";

async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();
    const databaseVersion = await database.query("SHOW server_version;");
    const databaseMaxConnections = await database.query(
      "SHOW max_connections;",
    );
    const databaseOpenConnections = await database.query({
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [process.env.POSTGRES_DB],
    });

    response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: databaseVersion.rows[0].server_version,
          max_connections: parseInt(
            databaseMaxConnections.rows[0].max_connections,
          ),
          open_connections: databaseOpenConnections.rows[0].count,
        },
      },
    });
  } catch (error) {
    const publicErrorObject = new InternalServerError({
      cause: error,
    });

    console.log("\nErro no catch do controller:");
    console.error(publicErrorObject);

    response.status(500).json(publicErrorObject);
  }
}

export default status;
