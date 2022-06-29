import {BotService} from "./services/bot";
import {IBot} from "./interfaces/Bot.interface";

const botInstance: IBot = new BotService();

botInstance.bot.launch();
