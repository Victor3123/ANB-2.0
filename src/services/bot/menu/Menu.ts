import MenuType from "src/types/Menu.type";
import MenuItem from "src/types/MenuItem.type";
import { Markup } from "telegraf";
import { InlineKeyboardButton, InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";

/**
 * @param sticker
 * @param description
 * @param command
 * @returns {MenuItem}
 */
function generate_item(sticker: string, description: string, command: string): MenuItem {
  return {
      sticker: sticker,
      description: description,
      command: command
    };
}

export class Menu implements MenuType {
  keyboard: Markup.Markup<InlineKeyboardMarkup>;

  readonly header = 'It is menu:';
  readonly items = [
    generate_item('✉️', 'Send anonymous message', 'send_anonymous_message'),
    generate_item('🈯', 'Choose language', 'choose_language'),
  ]
  readonly footer = 'Please choose action and press on button:👇';

  constructor () {
   this.keyboard = this.generateKeyboard();
  }

  protected generateKeyboard() {
    const buttons: InlineKeyboardButton[] = [];
    this.items.map((item: MenuItem) => {
      buttons.push(Markup.button.callback(item.sticker, item.command));
    });
    return Markup.inlineKeyboard(buttons);
  }

  get messageStringify() {
    let text = `${this.header}\n`;
    this.items.map((item: MenuItem) => {
      text = text.concat(`\n   ${item.sticker}:   ${item.description}`);
    });
    text = text.concat(`\n\n${this.footer}`)
    return text;
  }
}
