import database from "infra/database";

async function status(request, response) {
  const result = await database.query("SELECT 1 + 1;");
  response.status(200).send(result.rows[0]);
}

export default status;
