export class MessagesError extends Error {
  readonly type: string;
  readonly code: string;
  readonly param?: string;
  readonly status: number;
  readonly requestId: string;

  constructor(opts: {
    type: string;
    code: string;
    message: string;
    param?: string;
    status: number;
    requestId: string;
  }) {
    super(opts.message);
    this.name = "MessagesError";
    this.type = opts.type;
    this.code = opts.code;
    this.param = opts.param;
    this.status = opts.status;
    this.requestId = opts.requestId;
  }
}

export class AuthenticationError extends MessagesError {
  constructor(opts: Omit<ConstructorParameters<typeof MessagesError>[0], "status">) {
    super({ ...opts, status: 401 });
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends MessagesError {
  constructor(opts: Omit<ConstructorParameters<typeof MessagesError>[0], "status">) {
    super({ ...opts, status: 403 });
    this.name = "AuthorizationError";
  }
}

export class InvalidRequestError extends MessagesError {
  constructor(opts: Omit<ConstructorParameters<typeof MessagesError>[0], "status">) {
    super({ ...opts, status: 400 });
    this.name = "InvalidRequestError";
  }
}

export class NotFoundError extends MessagesError {
  constructor(opts: Omit<ConstructorParameters<typeof MessagesError>[0], "status">) {
    super({ ...opts, status: 404 });
    this.name = "NotFoundError";
  }
}


export class RateLimitError extends MessagesError {
  constructor(opts: Omit<ConstructorParameters<typeof MessagesError>[0], "status">) {
    super({ ...opts, status: 429 });
    this.name = "RateLimitError";
  }
}

export class SignatureVerificationError extends Error {
  constructor(message = "Webhook signature verification failed") {
    super(message);
    this.name = "SignatureVerificationError";
  }
}

export function errorFromResponse(
  status: number,
  body: { error: { type: string; code: string; message: string; param?: string }; request_id: string },
): MessagesError {
  const opts = {
    type: body.error.type,
    code: body.error.code,
    message: body.error.message,
    param: body.error.param,
    requestId: body.request_id,
  };

  switch (status) {
    case 401:
      return new AuthenticationError(opts);
    case 403:
      return new AuthorizationError(opts);
    case 404:
      return new NotFoundError(opts);
    case 429:
      return new RateLimitError(opts);
    default:
      if (status >= 400 && status < 500) return new InvalidRequestError(opts);
      return new MessagesError({ ...opts, status });
  }
}
