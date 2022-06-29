import {ILocalisation} from '../../interfaces/Localisation.interface';
import {ILanguage} from '../../interfaces/Language.interface';
import {UserId} from '../../types/user-id';
import {EN, UA} from '../../constants/localisation';
import {db} from '../../db';

export default class LocalisationService implements ILocalisation{
  private readonly defaultLanguage$: ILanguage;

  constructor() {
    this.defaultLanguage$ = EN;
  }

  public get defaultLanguage(): ILanguage {
    return this.defaultLanguage$;
  }

  public async setLanguage(lang: ILanguage, user: UserId) {
    await db.collection('users').doc(String(user)).update({language: lang});
  }
}
