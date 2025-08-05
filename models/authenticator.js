import user from "models/user.js";
import password from "models/password.js";
import { NotFoundError, UnauthorizedError } from "infra/errors.js";

const authentication = {
  login,
};
export default authentication;

async function login(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);
    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem",
        action: "Verifique se os dados enviados estão corretos;",
        cause: error,
      });
    }
    throw error;
  }
}

async function findUserByEmail(providedEmail) {
  try {
    return await user.findOneByEmail(providedEmail);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError({
        message: "Usuário não encontrado",
        action: "Verifique se os dados enviados estão corretos;",
        cause: error,
      });
    }
    throw error;
  }
}

async function validatePassword(providedPassword, storedPassword) {
  const passwordMatch = await password.compare(
    providedPassword,
    storedPassword,
  );

  if (!passwordMatch) {
    throw new UnauthorizedError({
      message: "Senha não confere",
      action: "Verifique se os dados enviados estão corretos;",
    });
  }
}
