export interface MessageSenderType {
  initMessageHandler(): NodeJS.Timer;
  readonly handler: () => void;
  readonly intervalTimeMs: Milliseconds;
}

export type Milliseconds = number;
