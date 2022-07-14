import {LoggerService} from '../logger/logger.service';
import {Context, Markup, Telegraf} from 'telegraf';
import {Update} from 'typegram';
import {Bot} from '../../types/Bot.type';
import {User} from '../../types/User.type';
import {Message} from '../../types/Message.type';
import LocalisationService from '../localisation/localisation.service';
import {db} from '../../db';
import {EN, UK} from '../../constants/localisation';
import {SENDING} from '../../constants/message/status.constants';
import { text } from '../localisation/text';
import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
import { UserId } from 'src/types/user-id';
import { Menu } from './menu';
import { MessageAction } from 'src/types/MessageAction.type';


export class BotService implements Bot {
  public bot: Telegraf<Context<Update>>;
  private ls;
  private messageAction: MessageAction = 'disabled';


  constructor() {
    this.bot = this.initBot();
    this.ls = new LocalisationService();
  }

  private clearAllActiveActions() {
    this.messageAction = 'disabled';
  }

  private initBot(): Telegraf<Context<Update>> {
    const bot = this.createTelegramBot();

    bot.start(this.startHandler());

    bot.command('menu', (ctx) => {
      this.sendMenu(ctx.update.message.from.id);
      this.clearAllActiveActions();
    });

    bot.on('message', async(ctx) => {
      if (this.messageAction === 'message_waiting') {
        const message: Message = {
          clientSideMessageId: String(ctx.update.message.message_id),
          clientChatId: String(ctx.update.message.chat.id),
          adminSideMessageId: null,
          date: new Date(),
          status: SENDING,
        };

        await new LoggerService().logMessage(message);

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

    bot.action('uk', async (ctx) => {
      Markup.removeKeyboard();
      await this.ls.setLanguage(UK, ctx.update.callback_query.from.id);
      ctx.reply('Мову обрано: Українська');
      ctx.editMessageReplyMarkup(undefined);
      this.sendMenu(ctx.update.callback_query.from.id);
      this.clearAllActiveActions();
    });

    bot.action('en', async (ctx) => {
      Markup.removeKeyboard();
      await this.ls.setLanguage(EN, ctx.update.callback_query.from.id);
      ctx.reply('Language chose: English');
      ctx.editMessageReplyMarkup(undefined);
      this.sendMenu(ctx.update.callback_query.from.id);
      this.clearAllActiveActions();
    });

    bot.action('send_anonymous_message', async(ctx) => {
      this.messageAction = 'message_waiting';
      ctx.reply(await this.ls.translate(
        'I am in waiting for your message...',
        await this.ls.getUserLanguage(ctx.update.callback_query.from.id)
      ));
    });

    bot.action('choose_language', async (ctx) => {
      await this.languageChoose(ctx.update.callback_query.from.id);
    });

    return bot;
  }

  protected createTelegramBot(): Telegraf<Context<Update>> {
    return new Telegraf(process.env.BOT_TOKEN as string);
  }

  private startHandler(): (ctx: Context) => Promise<void> {
    return async (ctx) => {
      console.log(`\n\n${ctx.message?.from.id}\n\n${ctx.message?.chat.id}`);
      const from = ctx.from;
      if (from !== undefined) {
        const response = await db.collection('users').get();

        let match = false;

        response.forEach(doc => {
          if (String(doc.data().id) === String(from.id)) {
            match = true;
          }
        })

        if (!match) {
          const user: User = {
            id: String(from.id),
            chatId: ctx.message?.chat.id,
            language: new LocalisationService().defaultLanguage,
            isBlocked: false,
            name: from.first_name,
          };

          await db.collection('users').doc(String(from.id)).set(user);
        }
        const language = await this.ls.getUserLanguage(from.id);

        const translation = await this.ls.translate(text.start, language)

        await ctx.reply(translation + ' => /menu');

        this.sendMenu(from.id);
      }
    };
  }

  sendMenu(id: UserId) {
    setTimeout(async () => {
      const menu = new Menu();
      const language = await this.ls.getUserLanguage(id);
      const translation = await this.ls.translate(menu.messageStringify, language);
      await this.bot.telegram.sendMessage(id, translation, menu.keyboard);
    }, 200)
  }

  async languageChoose(id: UserId) {
    const keyboard: Markup.Markup<InlineKeyboardMarkup> = Markup.inlineKeyboard([
      Markup.button.callback('🇺🇦', UK.code),
      Markup.button.callback('🇬🇧', EN.code),
    ]);

    await this.bot.telegram.sendMessage(
      id,
      await this.ls.translate(
        'Please choose a language, press on button:👇🈯',
        await this.ls.getUserLanguage(id)
      ),
      keyboard
    )
  }
}
