import crypto from "node:crypto";
import database from "infra/database.js";

const EXPIRATION_IN_MILISECS = 60 * 60 * 24 * 30 * 1000; //30 D

const session = {
  create,
  EXPIRATION_IN_MILISECS,
};

export default session;

async function create(userId) {
  const now = Date.now();
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(now + EXPIRATION_IN_MILISECS);
  const createdAt = new Date(now);

  const text =
    "INSERT INTO sessions (token, user_id, expires_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $4) RETURNING *;";
  const values = [token, userId, expiresAt, createdAt];

  const results = await database.query({ text, values });
  return results.rows[0];
}
