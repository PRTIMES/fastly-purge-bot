export class KnownError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class NoServiceFoundError extends KnownError {
  constructor(serviceName: string) {
    super(`No service found with name: ${serviceName}`);
    this.name = 'NoServiceFoundError';
  }
}

export class FastlyError extends KnownError {
  constructor(operationName: string) {
    super(`Fastly API operation failed: ${operationName}`);
    this.name = 'FastlyError';
  }
}
