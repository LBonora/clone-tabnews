import bcryptjs from "bcryptjs";

const ROUNDS = process.env.NODE_ENV === "production" ? 14 : 4;
const PEPPER = String(process.env.PEPPER || "🌶️");

async function hash(password) {
  return await bcryptjs.hash(password + PEPPER, ROUNDS);
}

async function compare(providedPassword, storedPassword) {
  return bcryptjs.compare(providedPassword + PEPPER, storedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
