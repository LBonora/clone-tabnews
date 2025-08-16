import crypto from "node:crypto";
import database from "infra/database.js";
import { UnauthorizedError } from "infra/errors.js";

const EXPIRATION_IN_MILISECS = 60 * 60 * 24 * 30 * 1000; //30 D

const session = {
  create,
  findOneValidByToken,
  renew,
  EXPIRATION_IN_MILISECS,
};

export default session;

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");

  const text =
    "INSERT INTO sessions (token, user_id) VALUES ($1, $2) RETURNING *;";
  const values = [token, userId];

  const results = await database.query({ text, values });
  return results.rows[0];
}

async function findOneValidByToken(sessionToken) {
  const text =
    "SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW() LIMIT 1;";
  const values = [sessionToken];

  const results = await database.query({ text, values });

  if (results.rowCount === 0) {
    throw new UnauthorizedError({
      message: "Usuário não possui sessão ativa",
      action: "Verifique se este usuário está logado e tente novamente",
    });
  }
  return results.rows[0];
}

async function renew(sessionId) {
  const expires_at = new Date(Date.now() + EXPIRATION_IN_MILISECS);
  const text =
    "UPDATE sessions SET expires_at = $2, updated_at = NOW() WHERE id = $1 RETURNING *;";
  const values = [sessionId, expires_at];

  const results = await database.query({ text, values });

  return results.rows[0];
}
