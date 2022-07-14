import {Logger} from '../../types/Logger.type';
import {Message} from '../../types/Message.type';
import {db} from '../../db';

export class LoggerService implements Logger {
  async logMessage(message: Message): Promise<Message | undefined> {
    try {
      await db.collection('messages').doc(String(message.clientSideMessageId)).set(message);
      return message;
    } catch(e: any) {
      console.log(e);
    }
  }
}
