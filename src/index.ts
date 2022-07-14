import {BotService} from './services/bot';
import {Bot} from './types/Bot.type';
import {SenderService} from './services/message-sender';

export const botInstance: Bot = new BotService();
new SenderService();
botInstance.bot.launch().then();
