import {MessageSenderType, Milliseconds} from '../../types/MessageSender.type';
import {db} from '../../db';
import {SENDING} from '../../constants/message/status.constants';
import {botInstance} from '../../index';
import {SENDED} from '../../constants/actions.constants';

export class SenderService implements MessageSenderType {
  private messageHandler: NodeJS.Timer;

  constructor() {
    this.messageHandler = this.initMessageHandler();
  }

  initMessageHandler(): NodeJS.Timer {
    return setInterval(this.handler, this.intervalTimeMs)
  }

  handler: () => void = function () {
    db.collection('messages').get()
      .then(messages => {
        messages.forEach((message) => {
          if (message.data().status === SENDING) {
            db.collection('users').get()
              .then((users) => {
                users.forEach(user => {
                  if (user.data().isAdmin !== undefined) {
                    botInstance.bot.telegram
                      .copyMessage(
                        user.data().chatId,
                        message.data().clientChatId,
                        message.data().clientSideMessageId
                      ).then(res => {
                      botInstance.bot.telegram.sendMessage(
                        user.data().chatId,
                        '#anonymousmessage',
                        {reply_to_message_id: res.message_id}
                      );
                    });
                    db.collection('messages').doc(message.id).set({
                      status: SENDED,
                    }, {merge: true});
                  }
                })
              });
          }
        });
      });

  }

  readonly intervalTimeMs: Milliseconds = 3000;
}
