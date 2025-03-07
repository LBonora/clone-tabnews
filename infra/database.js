import { Client } from "pg";

import { ServiceError } from "./errors.js";

async function query(queryObject) {
  const client = await getNewClient();

  try {
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    const serviceErrorObject = new ServiceError({
      message: `Erro na Query: ${queryObject}`,
      cause: error,
    });
    throw serviceErrorObject;
  } finally {
    await client?.end();
  }
}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSSLValues(),
  });

  try {
    await client.connect();
    return client;
  } catch (error) {
    client?.end();
    const serviceErrorObject = new ServiceError({
      message: "Erro na conexão com o banco de dados.",
      cause: error,
    });
    throw serviceErrorObject;
  }
}

const database = {
  query,
  getNewClient,
};

export default database;

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }

  return process.env.NODE_ENV === "production" ? true : false;
}
