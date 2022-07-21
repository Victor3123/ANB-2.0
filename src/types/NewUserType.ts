import {UserId} from './user-id';
import {Language} from './Language.type';
import { MessageAction } from './MessageAction.type';
import {LanguageCode} from './localisation';

export interface NewUserType {
  name: string;
  telegramUserId: number;
  chatId:  number;
}
