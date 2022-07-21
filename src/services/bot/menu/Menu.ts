import MenuType from "src/types/Menu.type";
import MenuItem from "src/types/MenuItem.type";
import { Markup } from "telegraf";
import { InlineKeyboardButton, InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";

export class Menu implements MenuType {
  keyboard: Markup.Markup<InlineKeyboardMarkup> = Markup.inlineKeyboard([]);

  header: string = 'It is menu:';
  items: MenuItem[] = [];
  footer: string = 'Please choose action and press on button:👇';

  protected generate_item(sticker: string, description: string, command: string): MenuItem {
    return {
        sticker: sticker,
        description: description,
        command: command
      };
  }

  protected generateKeyboard(): Markup.Markup<InlineKeyboardMarkup> {
    const buttons: InlineKeyboardButton[] = [];
    this.items.map((item: MenuItem) => {
      buttons.push(Markup.button.callback(item.sticker, item.command));
    });
    return Markup.inlineKeyboard(buttons);
  }

  get messageStringify(): string {
    let text = `${this.header}\n`;
    this.items.map((item: MenuItem) => {
      text = text.concat(`\n   ${item.sticker}:   ${item.description}`);
    });
    text = text.concat(`\n\n${this.footer}`)
    return text;
  }
}
