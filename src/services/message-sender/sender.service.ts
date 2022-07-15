import {MessageSenderType, Milliseconds} from '../../types/MessageSender.type';
import {db} from '../../db';
import {SENDING} from '../../constants/message/status.constants';
import {botInstance} from '../../index';
import {SENT} from '../../constants/message/status.constants';
import {firestore} from 'firebase-admin/lib/firestore/firestore-namespace';
import QueryDocumentSnapshot = firestore.QueryDocumentSnapshot;

export class SenderService implements MessageSenderType {
  public readonly intervalTimeMs: Milliseconds = 3000;

  private messageHandler: NodeJS.Timer;
  private messagesCollection: string = 'messages';
  private usersCollection: string = 'users';

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
            admin.data().chatId,
            message.data().clientChatId,
            message.data().clientSideMessageId
          ).then(res => {
          botInstance.bot.telegram.sendMessage(
            admin.data().chatId,
            '#anonymousmessage',
            {reply_to_message_id: res.message_id}
          );
          this.addOneAdminChatId(message.data().clientSideMessageId, res.message_id);
          this.setStatusMessage(message.data().clientSideMessageId, SENT);
        });
      });
    });
  }

  protected async getMessagesInProcessing(): Promise<QueryDocumentSnapshot[]> {
    let messages: QueryDocumentSnapshot[] = [];

    const snapshot = await db.collection(this.messagesCollection).get();
    snapshot.forEach(message => {
      if (message.data().status === SENDING) {
        messages.push(message);
      }
    });

    return messages;
  }

  protected async getAdmins(): Promise<QueryDocumentSnapshot[]> {
    const admins: QueryDocumentSnapshot[] = [];

    const snapshot = await db.collection(this.usersCollection).get();
    snapshot.forEach(user => {
      if (user.data().isAdmin !== undefined) {
        admins.push(user);
      }
    });

    return admins;
  }

  protected async setStatusMessage(clientSideId: string, status: string) {
    await db.collection(this.messagesCollection).doc(clientSideId)
      .set({
        status: status,
      }, {merge: true})
  }

  protected async addOneAdminChatId(
    clientSideMessageId: string | number,
    adminSideMessageId: string | number,
  ): Promise<void> {
    const messages = await db.collection(this.messagesCollection).get();

    messages.forEach(message => {
      if (
        String(clientSideMessageId)
        ===
        String(message.data().clientSideMessageId)
      ) {
        if (message.data().adminSideMessageId !== null) {
          const array: string[] = message.data().adminSideMessageId;
          array.push(String(adminSideMessageId));
          db.collection(this.messagesCollection).doc(String(clientSideMessageId))
            .set({
              adminSideMessageId: array
            }, {merge: true});
        } else {
          db.collection(this.messagesCollection).doc(String(clientSideMessageId))
            .set({
              adminSideMessageId: [String(adminSideMessageId)]
            }, {merge: true});
        }
      }
    });
  }
}
