import {Logger} from '../../types/Logger.type';
import {Message} from '../../types/Message.type';
import db from '../../db/database';

export class LoggerService implements Logger {
  async logMessage(message: Message): Promise<Message | undefined> {
    try {
      const res = await db.query(
        'INSERT INTO messages (client_chat_id, client_message_id, status) VALUES ($1, $2, $3) RETURNING *',
        [message.clientChatId, message.clientSideMessageId, message.status]
      )
      return res.rows[0];

    }

    catch(e: any) {
      console.log(e);
    }
  }
}
