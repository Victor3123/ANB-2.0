import { LanguageCode } from "src/types/localisation";
import MenuItem from "src/types/MenuItem.type";
import { Markup } from "telegraf";
import { InlineKeyboardButton, InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";

export default interface IMenu {
  header: string;
  items: MenuItem[];
  footer: string;
  
  keyboard: Markup.Markup<InlineKeyboardMarkup>;

  get stringifiedMessage(): string;
} 
