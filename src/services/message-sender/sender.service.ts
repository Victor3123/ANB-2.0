import {MessageSenderType, Milliseconds} from '../../types/MessageSender.type';
import db from '../../db/database';
import {SENDING} from '../../constants/message/status.constants';
import {botInstance} from '../../index';
import {SENT} from '../../constants/message/status.constants';
import {QueryResultRow} from 'pg';
import {MessageStatus} from '../../types/message/status';

export class SenderService implements MessageSenderType {
  public readonly intervalTimeMs: Milliseconds = 3000;

  private messageHandler: NodeJS.Timer;

  constructor() {
    this.messageHandler = this.initMessageHandler();
  }

  public initMessageHandler(): NodeJS.Timer {
    const senderHandler = this.handler.bind(SenderService);
    return setInterval(senderHandler, this.intervalTimeMs)
  }

  public handler: () => void = async () => {
    const messagesInProcessing = await this.getMessagesInProcessing();

    messagesInProcessing.map(async message => {
      const admins = await this.getAdmins();

      admins.map(admin => {
        botInstance.bot.telegram
          .copyMessage(
            admin.chat_id,
            message.client_chat_id,
            message.client_message_id
          ).then(res => {
          botInstance.bot.telegram.sendMessage(
            admin.chat_id,
            '#anonymousmessage',
            {reply_to_message_id: res.message_id}
          );

          this.addOneAdminChatId(message.client_message_id, res.message_id);
          this.setStatusMessage(message.client_message_id, SENT);
        });
      });
    });
  }

  protected async getMessagesInProcessing(): Promise<QueryResultRow[]> {
    const messageRes = await db.query(
      'SELECT * FROM messages WHERE status = $1',
      [SENDING]
    );

    return messageRes.rows;
  }

  protected async getAdmins(): Promise<QueryResultRow[]> {
    const usersRes = await db.query('SELECT * FROM users WHERE is_admin = true');

    return usersRes.rows;
  }

  protected async setStatusMessage(clientMessageId: string, status: MessageStatus) {
    await db.query(
      'UPDATE messages SET status = $1 WHERE client_message_id = $2',
      [status, clientMessageId]
    );
  }

  protected async addOneAdminChatId(
    clientSideMessageId: number,
    adminSideMessageId: number,
  ): Promise<void> {
    await db.query(
      'UPDATE messages SET admin_message_id = array_append(admin_message_id, $1) WHERE client_message_id = $2',
      [adminSideMessageId, clientSideMessageId]
    )
  }
}
