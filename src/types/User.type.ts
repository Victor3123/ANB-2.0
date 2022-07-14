import {UserId} from './user-id';
import {Language} from './Language.type';

export interface User {
  id: UserId;
  chatId?: string | number;
  language: Language;
  isBlocked: boolean;
  name: string;
}
