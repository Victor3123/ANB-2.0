import {Message} from './Message.type';

export interface Logger {
  logMessage(message: Message): /*Promise<Message | undefined>*/ void;
}
