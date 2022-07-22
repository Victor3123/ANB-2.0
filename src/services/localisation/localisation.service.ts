import {Localisation} from '../../types/Localisation.type';
import {Language} from '../../types/Language.type';
import {UserId} from '../../types/user-id';
import {EN} from '../../constants/localisation';
import db from '../../db/database';
import {LanguageCode} from '../../types/localisation';
import translate from '@vitalets/google-translate-api';

export default class LocalisationService implements Localisation {
  private readonly defaultLanguage$: Language;

  constructor() {
    this.defaultLanguage$ = EN;
  }

  public get defaultLanguage(): Language {
    return this.defaultLanguage$;
  }

  async setLanguage(lang: Language, id: UserId) {

    await db.query(
      `
          UPDATE user_languages
          SET code = $1
          FROM users
          WHERE user_languages.user_id = users.id
            AND users.telegram_user_id = $2;
      `,
      [lang.code, id]
    );
  }

  async getUserLanguage(id: UserId): Promise<LanguageCode> {
    const res = await db.query(
      `
          SELECT users.id,
                 users.telegram_user_id,
                 ul.code
          FROM users
                   JOIN user_languages ul on users.id = ul.user_id
          WHERE telegram_user_id = $1
          LIMIT 1;
      `,
      [id]
    );
    return res.rows[0].code;
  }

  async translate(text: string, to: LanguageCode): Promise<string> {
    const res = await translate(text, {to: to});
    return res.text;
  }
}

