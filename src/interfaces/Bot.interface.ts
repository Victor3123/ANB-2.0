import {Telegraf, Context } from 'telegraf';
import { Update } from 'typegram';

export interface IBot {
  bot: Telegraf<Context<Update>>;
}
