export abstract class DomainError extends Error {
  abstract readonly tag: string;
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvariantViolation extends DomainError {
  readonly tag = "InvariantViolation";
}

export class NotFound extends DomainError {
  readonly tag = "NotFound";
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`);
  }
}

export class ValidationError extends DomainError {
  readonly tag = "ValidationError";
  constructor(
    public readonly field: string,
    public readonly reason: string,
  ) {
    super(`${field}: ${reason}`);
  }
}

export class GatewayError extends DomainError {
  readonly tag = "GatewayError";
  constructor(
    public readonly gateway: string,
    public readonly status: number,
    message: string,
  ) {
    super(`${gateway} (${status}): ${message}`);
  }
}
