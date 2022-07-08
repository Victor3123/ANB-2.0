import {ILocalisation} from '../../interfaces/Localisation.interface';
import {ILanguage} from '../../interfaces/Language.interface';
import {UserId} from '../../types/user-id';
import {EN, UK} from '../../constants/localisation';
import {db} from '../../db';
import {LanguageCode} from '../../types/localisation';
import {firestore} from 'firebase-admin';
import translate from '@vitalets/google-translate-api';
import DocumentData = firestore.DocumentData;

export default class LocalisationService implements ILocalisation {
  private readonly defaultLanguage$: ILanguage;

  constructor() {
    this.defaultLanguage$ = EN;
  }

  public get defaultLanguage(): ILanguage {
    return this.defaultLanguage$;
  }

  async setLanguage(lang: ILanguage, user: UserId) {
    await db.collection('users').doc(String(user)).set({language: lang}, {merge: true});
  }

  async getUserLanguage(id: UserId): Promise<any> {
    let code;
    const response = await db.collection('users').get();
    response.forEach((doc: DocumentData) => {
      if (String(id) === String(doc.id)) {
        code = doc.data().language.code;
      }
    })
    return code;
  }

  async translate(text: string, to: LanguageCode): Promise<string> {
    const res = await translate(text, {to: to});
    return res.text;
  } 
}
