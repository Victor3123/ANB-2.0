import {ILogger} from '../../interfaces/Logger.interface';
import {IMessage} from '../../interfaces/Message.interface';
import {db} from '../../db';

export class LoggerService implements ILogger {
  async logMessage(message: IMessage): Promise<IMessage | undefined> {
    try {
      await db.collection('message').doc(String(message.date)).set(message);
      return message;
    } catch(e: any) {
      console.log(e);
    }
  }
}