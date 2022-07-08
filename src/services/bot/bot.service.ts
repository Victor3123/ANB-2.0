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
import { text } from '../localisation/text';
import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
import { UserId } from 'src/types/user-id';
import { Menu } from './menu';
import { MessageAction } from 'src/types/MessageAction.type';


export class BotService implements IBot {
  public bot: Telegraf;
  private ls;
  private messageAction: MessageAction = 'disabled';
  

  constructor() {
    this.bot = this.initBot();
    this.ls = new LocalisationService();
  }

  private cleareAllActiveActions() {
    this.messageAction = 'disabled';
  }

  private initBot(): any {
    const bot = this.createTelegramBot();

    bot.start(this.startHandler());

    bot.command('menu', (ctx: any) => {
      this.sendMenu(ctx.update.message.from.id);
      this.cleareAllActiveActions();
    });

    bot.on('message', async(ctx: any) => {
      if (this.messageAction === 'message_waiting') {
        const message: IMessage = {
          clientSideMessageId: String(ctx.update.message.message_id),
          clientChatId: String(ctx.update.message.chat.id),
          adminSideMessageId: null,
          date: ctx.update.message.date,
          status: SENDING,
        };
  
        new LoggerService().logMessage(message);
        
        this.messageAction = 'disabled';
        ctx.reply(
          await this.ls.translate(
            'Message sent to processing',
             await this.ls.getUserLanguage(ctx.update.message.from.id)
          )
        );
        this.sendMenu(ctx.update.message.from.id);
      } else {
        ctx.reply(
          await this.ls.translate(
            'Unknown answer, please choose one of the given answers',
             await this.ls.getUserLanguage(ctx.update.message.from.id)
          )
        );
        this.sendMenu(ctx.update.message.from.id);
      }
    });

    bot.action('uk', (ctx: any) => {
      Markup.removeKeyboard();
      this.ls.setLanguage(UK, ctx.update.callback_query.from.id);
      ctx.reply('Мову обрано: Українська');
      ctx.editMessageReplyMarkup({
        reply_markup: false,
      });
      this.sendMenu(ctx.update.callback_query.from.id);
      this.cleareAllActiveActions();
    });

    bot.action('en', (ctx: any) => {
      Markup.removeKeyboard();
      this.ls.setLanguage(EN, ctx.update.callback_query.from.id);
      ctx.reply('Language chose: English');
      ctx.editMessageReplyMarkup({
        reply_markup: false,
      });
      this.sendMenu(ctx.update.callback_query.from.id);
      this.cleareAllActiveActions();
    });

    bot.action('send_anonumoys_message', async(ctx: any) => {
      this.messageAction = 'message_waiting';
      ctx.reply(await this.ls.translate(
        'I am in waiting for your message...',
        await this.ls.getUserLanguage(ctx.update.callback_query.from.id)
      ));
    });

    bot.action('choose_language', (ctx: any) => {
      this.languageChoose(ctx.update.callback_query.from.id);
    });

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

      const translatation = await this.ls.translate(text.start, language)

      ctx.reply(translatation + ' => /menu');

      this.sendMenu(from.id);
    };
  }

  sendMenu(id: UserId) {
    setTimeout(async () => {
      const menu = new Menu();
      const language = await this.ls.getUserLanguage(id);
      const translatation = await this.ls.translate(menu.stringifiedMessage, language);
      this.bot.telegram.sendMessage(id, translatation, menu.keyboard);
    }, 200)
  }

  async languageChoose(id: UserId) {
    const keyboard: Markup.Markup<InlineKeyboardMarkup> = Markup.inlineKeyboard([
      Markup.button.callback('🇺🇦', UK.code),
      Markup.button.callback('🇬🇧', EN.code),
    ]);

    this.bot.telegram.sendMessage(
      id,
      await this.ls.translate(
        'Please choose a language, press on button:👇🈯',
        await this.ls.getUserLanguage(id)
      ),
      keyboard
    )
  }
}
