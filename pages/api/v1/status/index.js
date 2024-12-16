function status(request, response) {
  response.status(200).send({ OK: "OK" });
}

export default status;
