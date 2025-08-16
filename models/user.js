import database from "infra/database.js";
import password from "models/password.js";
import { NotFoundError, ValidationError } from "infra/errors.js";

const user = { findOneById, findOneByUsername, findOneByEmail, create, update };
export default user;

async function findOneById(id) {
  const text = "SELECT * FROM users WHERE id = $1 LIMIT 1;";
  const values = [id];
  const results = await database.query({ text, values });

  if (results.rowCount === 0) {
    throw new NotFoundError({
      name: "NotFoundError",
      message: "O id informado não foi encontrado no sistema",
      action: "Verifique se o id está digitado corretamente",
    });
  }

  return results.rows[0];
}

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);
  return userFound;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: "SELECT * FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1;",
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema",
        action: "Verifique se o username está digitado corretamente",
        status_code: 404,
      });
    }
    return results.rows[0];
  }
}

async function findOneByEmail(email) {
  const userFound = await runSelectQuery(email);
  return userFound;

  async function runSelectQuery(email) {
    const results = await database.query({
      text: "SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1;",
      values: [email],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        name: "NotFoundError",
        message: "O email informado não foi encontrado no sistema",
        action: "Verifique se o email está digitado corretamente",
        status_code: 404,
      });
    }
    return results.rows[0];
  }
}

async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);
  await hashPasswordInObject(userInputValues);
  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function runInsertQuery(userInputValues) {
    const results = await database.query({
      text: "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *;",
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });
    return results.rows[0];
  }
}

async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    if (userInputValues.username.toLowerCase() != username.toLowerCase()) {
      await validateUniqueUsername(userInputValues.username);
    }
  }

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const updatedUser = await runUpdateQuery(currentUser.id, userInputValues);
  //const modifiedUserValues = { ...currentUser, ...userInputValues };
  //const updatedUser = await runUpdateQuery(modifiedUserValues);

  return updatedUser;

  /* //keep for curso.dev reference
  async function runUpdateQuery(newValues) {
    const results = await database.query({
      text: `
        UPDATE
          users
        SET
          username = $2,
          email = $3,
          password = $4,
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      `,
      values: [
        newValues.id,
        newValues.username,
        newValues.email,
        newValues.password,
      ],
    });
    return results.rows[0];
  }*/
}

async function runUpdateQuery(userId, newValues) {
  const fields = ["username", "email", "password"];
  const setFields = [];
  const values = [userId];
  let index = 2;
  fields.forEach((field) => {
    if (field in newValues) {
      setFields.push(`${field} = $${index}`);
      index += 1;
      values.push(newValues[field]);
    }
  });

  if (index == 2) {
    throw new ValidationError({
      message: "Alterações nos dados não foram informadas.",
      action: "Informe possíveis alterações nos campos válidos.",
      status_code: 400,
    });
  }

  const joinedFields = setFields.join(", ");
  const text = `UPDATE users SET ${joinedFields}, updated_at = timezone('utc', now()) WHERE id = $1 RETURNING *;`;

  const results = await database.query({ text, values });
  return results.rows[0];
}

async function validateUniqueUsername(username) {
  const results = await database.query({
    text: "SELECT username FROM users WHERE LOWER(username) = LOWER($1);",
    values: [username],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O username informado já está em uso.",
      action: "Utilize outro username para realizar esta operação.",
    });
  }
}

async function validateUniqueEmail(email) {
  const results = await database.query({
    text: "SELECT email FROM users WHERE LOWER(email) = LOWER($1);",
    values: [email],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O email informado já está em uso.",
      action: "Utilize outro email para realizar esta operação.",
    });
  }
}

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}
