import MenuItem from "src/types/MenuItem.type";
import { Markup } from "telegraf";
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";

export default interface MenuType {
  header: string;
  items: MenuItem[];
  footer: string;

  keyboard: Markup.Markup<InlineKeyboardMarkup>;

  get messageStringify(): string;
}
