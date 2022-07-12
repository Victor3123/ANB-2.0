import {BotService} from "./services/bot";
import {Bot} from "./types/Bot.type";


async function main(): Promise<void> {
  const botInstance: Bot = new BotService();
  await botInstance.bot.launch();
}

main().then();
