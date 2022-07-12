import {Language} from './Language.type';
import {UserId} from './user-id';

export interface Localisation {
  readonly defaultLanguage: Language;

  setLanguage(lang: Language, user: UserId): void;
}
