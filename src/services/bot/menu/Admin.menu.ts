import { Menu } from "./Menu";

export class AdminMenu extends Menu {
  constructor() {
    super();
    super.items = [
      super.generate_item('❓', 'Get help', 'get_help'),
      super.generate_item('🈯', 'Choose language', 'choose_language'),
    ];
    super.keyboard = super.generateKeyboard();
  }
}