export class CustomError extends Error {
  constructor(message, { name, action, statusCode, cause }) {
    super(message || "Erro desconhecido.", { cause });
    this.name = name || "CustomError";
    this.action = action || "No action.";
    this.statusCode = statusCode || 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class MethodNotAllowedError extends CustomError {
  constructor() {
    super("Método não permitido para este endpoint.", {
      name: "MethodNotAllowedError",
      action: "Verifique se o método HTTP enviado é válido para esse endpoint.",
      statusCode: 405,
    });
  }
}

export class ServiceError extends CustomError {
  constructor({ message, cause }) {
    super(message || "Serviço indisponível no momento", {
      name: "ServiceError",
      action: "Verifique se o serviço está disponível",
      statusCode: 503,
      cause,
    });
  }
}

export class InternalServerError extends CustomError {
  constructor({ cause, statusCode }) {
    super("Aconteceu um erro interno não esperado.", {
      name: "InternalServerError",
      action: "Entre em contato com o suporte",
      statusCode: statusCode || 500,
      cause,
    });
  }
}
