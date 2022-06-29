import {ILanguage} from './Language.interface';
import {UserId} from '../types/user-id';

export interface ILocalisation {
  readonly defaultLanguage: ILanguage;

  setLanguage(lang: ILanguage, user: UserId): void;
}
