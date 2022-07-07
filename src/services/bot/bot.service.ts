import {LoggerService} from '../logger/logger.service';
import {Context, Markup, Telegraf} from 'telegraf';
import {Update} from 'typegram';
import {IBot} from '../../interfaces/Bot.interface';
import {IUser} from '../../interfaces/User.interface';
import {IMessage} from '../../interfaces/Message.interface';
import LocalisationService from '../localisation/localisation.service';
import {db} from '../../db';
import {EN, UK} from '../../constants/localisation';
import {SENDING} from '../../constants/message/status.constants';
import {text} from '../../text';
import translate from '@vitalets/google-translate-api';
import {ILocalisation} from '../../interfaces/Localisation.interface';

export class BotService implements IBot {
  public bot;
  private ls;

  constructor() {
    this.bot = this.initBot();
    this.ls = new LocalisationService();
  }

  private initBot(): any {
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

    bot.action('uk', (ctx: any) => {
      Markup.removeKeyboard();
      this.ls.setLanguage(UK, ctx.update.callback_query.from.id);
      ctx.reply('Мову обрано: Українська');
      ctx.editMessageReplyMarkup({
        reply_markup: false,
      })
    })

    bot.action('en', (ctx: any) => {
      Markup.removeKeyboard();
      this.ls.setLanguage(EN, ctx.update.callback_query.from.id);
      ctx.reply('Language chose: English');
      ctx.editMessageReplyMarkup({
        reply_markup: false,
      })
    })

    return bot;
  }

  protected createTelegramBot(): Telegraf<Context<Update>> {
    return new Telegraf(process.env.BOT_TOKEN as string);
  }

  private startHandler(): (ctx: any) => Promise<void> {
    return async (ctx: any) => {
      const from = ctx.update.message.from;
      const response = await db.collection('users').get();

      let match = false;

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
      }
      const language = await this.ls.getUserLanguage(from.id);

      const keyboard = Markup.inlineKeyboard([
        Markup.button.callback('🇺🇦', UK.code),
        Markup.button.callback('🇬🇧', EN.code),
      ]);
      translate(text.start, {to: language}).then(res => {
        ctx.reply(res.text, keyboard);
      }).catch(err => {
        console.log(err);
        ctx.reply(text.start, keyboard);
      });

    };
  }
}