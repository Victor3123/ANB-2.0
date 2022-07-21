import MenuItem from "src/types/MenuItem.type";
import { Menu } from "./Menu";

export class UserMenu extends Menu {
  constructor() {
    super();
    super.items = [
      super.generate_item('✉️', 'Send anonymous message', 'send_anonymous_message'),
      super.generate_item('🈯', 'Choose language', 'choose_language'),
    ];
    super.keyboard = super.generateKeyboard();
  }
}
