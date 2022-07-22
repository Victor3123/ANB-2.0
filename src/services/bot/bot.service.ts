import {LoggerService} from '../logger/logger.service';
import {Context, Markup, Telegraf} from 'telegraf';
import {Update} from 'typegram';
import {Bot} from '../../types/Bot.type';
import {Message} from '../../types/Message.type';
import LocalisationService from '../localisation/localisation.service';
import db from '../../db/database';
import {EN, UK} from '../../constants/localisation';
import {SENDING} from '../../constants/message/status.constants';
import {text} from '../localisation/text';
import {InlineKeyboardMarkup} from 'telegraf/typings/core/types/typegram';
import {UserId} from 'src/types/user-id';
import {UserMenu, AdminMenu} from './menu';
import {MessageAction} from 'src/types/MessageAction.type';
import {User} from './User';
import _ from 'lodash';

class Action {
  static async getMessageAction(id: UserId) {
    const res = await db.query(
      `
          SELECT ul.action
          FROM users
                   JOIN user_actions ul on users.id = ul.user_id
          WHERE telegram_user_id = $1;
      `,
      [id]
    );
    if (!_.isEmpty(res.rows)) {
      return res.rows[0].action;
    }
  }

  static async setMessageAction
  (
    id: UserId,
    action: MessageAction
  ): Promise<void> {
    await db.query(
      `
          UPDATE user_actions
          SET action = $1
          FROM users
          WHERE user_actions.user_id = users.id
            AND users.telegram_user_id = $2;
      `, [action, id]);
  }
}

export class BotService implements Bot {
  public bot: Telegraf<Context<Update>>;
  private ls;

  constructor() {
    this.bot = this.initBot();
    this.ls = new LocalisationService();
  }

  private async clearAllActiveActions(userId: UserId) {
    await Action.setMessageAction(userId, 'disabled');
  }

  private initBot(): Telegraf<Context<Update>> {
    const bot = this.createTelegramBot();

    bot.start(this.startHandler());

    bot.command('menu', async (ctx) => {
      await this.sendUserMenu(ctx.update.message.from.id);
      this.clearAllActiveActions(ctx.update.message.from.id);
    });

    bot.on('message', async (ctx) => {
      if (
        await Action.getMessageAction(ctx.update.message.from.id)
        ===
        'message_waiting'
      ) {
        const message: Message = {
          clientSideMessageId: ctx.update.message.message_id,
          clientChatId: ctx.update.message.chat.id,
          adminSideMessageId: null,
          date: new Date(),
          status: SENDING,
        };

        await new LoggerService().logMessage(message);

        this.clearAllActiveActions(ctx.update.message.from.id);
        await ctx.reply(
          await this.ls.translate(
            'Message sent to processing',
            await this.ls.getUserLanguage(ctx.update.message.from.id)
          )
        );
        await this.sendUserMenu(ctx.update.message.from.id);
      } else {
        await ctx.reply(
          await this.ls.translate(
            'Unknown answer, please choose one of the given answers',
            await this.ls.getUserLanguage(ctx.update.message.from.id)
          )
        );
        await this.sendUserMenu(ctx.update.message.from.id);
      }
    });

    bot.action('uk', async (ctx) => {
      Markup.removeKeyboard();
      await this.ls.setLanguage(UK, ctx.update.callback_query.from.id);
      await ctx.reply('Мову обрано: Українська');
      await ctx.editMessageReplyMarkup(undefined);
      await this.sendUserMenu(ctx.update.callback_query.from.id);
      this.clearAllActiveActions(ctx.update.callback_query.from.id);
    });

    bot.action('en', async (ctx) => {
      Markup.removeKeyboard();
      await this.ls.setLanguage(EN, ctx.update.callback_query.from.id);
      await ctx.reply('Language chose: English');
      await ctx.editMessageReplyMarkup(undefined);
      await this.sendUserMenu(ctx.update.callback_query.from.id);
      this.clearAllActiveActions(ctx.update.callback_query.from.id);
    });

    bot.action('send_anonymous_message', async (ctx) => {
      await Action.setMessageAction(ctx.update.callback_query.from.id, 'message_waiting');
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
      const from = ctx.from;

      await User.registerUser({
        telegramUserId: from!.id,
        chatId: ctx.message!.chat.id,
        name: from!.first_name,
      });

      const language = await this.ls.getUserLanguage(from!.id);
      const translation = await this.ls.translate(text.start, language)

      await ctx.reply(translation + ' => /menu');
      await this.sendUserMenu(from!.id);
    };
  }

  private async sendUserMenu(id: UserId) {
    const menu = new UserMenu();
    const language = await this.ls.getUserLanguage(id);
    const translation = await this.ls.translate(menu.messageStringify, language);
    await this.bot.telegram.sendMessage(id, translation, menu.keyboard);
  }

  private sendAdminMenu(id: UserId) {
    setTimeout(async () => {
      const menu = new AdminMenu();
      const language = await this.ls.getUserLanguage(id);
      const translation = await this.ls.translate(menu.messageStringify, language);
      await this.bot.telegram.sendMessage(id, translation, menu.keyboard);
    }, 200)
  }

  private async languageChoose(id: UserId) {
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
