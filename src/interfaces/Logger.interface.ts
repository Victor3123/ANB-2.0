import {IMessage} from './Message.interface';

export interface ILogger {
  logMessage(message: IMessage): Promise<IMessage | undefined>;
}