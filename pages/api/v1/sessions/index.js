import { createRouter } from "next-connect";
import * as cookie from "cookie";
import controller from "infra/controller.js";
import authentication from "models/authenticator.js";
import session from "models/session.js";

const router = createRouter();
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;

  const authenticatedUser = await authentication.login(
    userInputValues.email,
    userInputValues.password,
  );

  const newSession = await session.create(authenticatedUser.id);

  const setCookie = cookie.serialize("session_id", newSession.token, {
    path: "/",
    //expires: new Date(newSession.expires_at),
    maxAge: session.EXPIRATION_IN_MILISECS / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  console.log(setCookie);

  response.setHeader("Set-Cookie", setCookie);

  return response.status(201).json(newSession);
}
