import crypto from "node:crypto";
import database from "infra/database.js";

const EXPIRATION_IN_MILISECS = 60 * 60 * 24 * 30 * 1000; //30 D

const session = {
  create,
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
