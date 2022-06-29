import {UserId} from '../types/user-id';
import {ILanguage} from './Language.interface';

export interface IUser {
  id: UserId;
  language: ILanguage;
  isBlocked: boolean;
  name: string;
}