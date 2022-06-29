import {Context, Telegraf} from 'telegraf';
import {Update} from 'typegram';
import {IBot} from '../../interfaces/Bot.interface';
import {db} from '../../db';
import {IUser} from '../../interfaces/User.interface';
import LocalisationService from '../localisation/localisation.service';
import {UA} from '../../constants/localisation';
import {LoggerService} from '../logger/logger.service';
import {IMessage} from '../../interfaces/Message.interface';
import {SENDING} from '../../constants/message/status.constants';

export class BotService implements IBot {
  public bot: Telegraf<Context<Update>>;

  constructor() {
    this.bot = this.initBot();
  }

  private initBot(): Telegraf<Context<Update>> {
    const bot = this.createTelegramBot();

    bot.start(this.startHandler());

    bot.on('message', (ctx: any) => {
      const message: IMessage = {
        clientSideMessageId: String(ctx.update.message.message_id),
        clientChatId: String(ctx.update.message.chat.id),
        adminSideMessageId: null,
        date: ctx.update.message.date,
        status: SENDING,
      };

      new LoggerService().logMessage(message);
    })

    return bot;
  }

  protected createTelegramBot(): Telegraf<Context<Update>> {
    return new Telegraf(process.env.BOT_TOKEN as string);
  }

  private startHandler(): (ctx: any) => Promise<void> {
    return async (ctx: any) => {
      const from = ctx.update.message.from;
      let match = false;
      const response = await db.collection('users').get();
      response.forEach(doc => {
        if (String(doc.data().id) === String(from.id)) {
          match = true;
        }
      })
      if (!match) {
        const user: IUser = {
          id: String(from.id),
          language: new LocalisationService().defaultLanguage,
          isBlocked: false,
          name: from.first_name,
        };
        await db.collection('users').doc(String(from.id)).set(user);
      } else {
        new LocalisationService().setLanguage(UA, from.id);
      }
    };
  }
}