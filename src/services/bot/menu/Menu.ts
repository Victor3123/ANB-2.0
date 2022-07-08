import IMenu from "src/interfaces/Menu.interface";
import MenuItem from "src/types/MenuItem.type";
import { Markup } from "telegraf";
import { InlineKeyboardButton, InlineKeyboardMarkup, KeyboardButton } from "telegraf/typings/core/types/typegram";

/**
 * @param sticker 
 * @param description 
 * @returns {MenuItem}
 */
function generate_item(sticker: string, description: string, command: string): MenuItem {
  return {
      sticker: sticker,
      description: description,
      command: command
    };
}

export class Menu implements IMenu {
  keyboard: Markup.Markup<InlineKeyboardMarkup>;

  readonly header = 'What you want to do? Please choose action and press on button';
  readonly items = [
    generate_item('😀', 'Happy', 'a'),
    generate_item('😛', 'tounge', 'b'),
    generate_item('🤓', 'glasses', 'c'),
    generate_item('🥶', 'cold', 'd'),
  ]
  readonly footer = 'i am footer';
  
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

  get stringifiedMessage() {
    let text = `${this.header}:\n`;
    this.items.map((item: MenuItem) => {
      text = text.concat(`\n   ${item.sticker}:   ${item.description}`);
    });
    text = text.concat(`\n\n${this.footer}`)
    return text;
  }
}
