import {UserId} from './user-id';
import {Language} from './Language.type';

export interface User {
  id: UserId;
  language: Language;
  isBlocked: boolean;
  name: string;
}
