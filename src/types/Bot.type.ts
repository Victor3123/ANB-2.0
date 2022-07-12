import {Telegraf, Context } from 'telegraf';
import { Update } from 'typegram';

export interface Bot {
  bot: Telegraf<Context<Update>>;
}
