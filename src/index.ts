import {BotService} from "./services/bot";
import {IBot} from "./interfaces/Bot.interface";

const botInstance: IBot = new BotService();

botInstance.bot.launch();
//
// import translate from '@vitalets/google-translate-api';
//
// translate('divka', {to: 'uk'}).then(res => {
//   console.log(res.text);
// }).catch(err => {
//   console.error(err);
// });
