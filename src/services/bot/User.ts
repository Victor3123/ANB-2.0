import db from '../../db/database';
import {NewUserType} from '../../types/NewUserType';
import {UserId} from '../../types/user-id';

export class User {
  static async registerUser(userObject: NewUserType) {
    const {telegramUserId, chatId, name} = userObject;
    try {
      const isUserExists = await db.query(
        'SELECT EXISTS(SELECT 1 FROM users WHERE telegram_user_id = $1)',
        [telegramUserId]
      );
      if (!isUserExists.rows[0].exists) {
        const user = await db.query(
          'INSERT INTO users (telegram_user_id, chat_id, name) VALUES ($1, $2, $3) RETURNING *',
          [telegramUserId, chatId, name]
        );

        await db.query('INSERT INTO user_languages (user_id) VALUES ($1)', [user.rows[0].id]);

        await db.query(
          'INSERT INTO user_actions (user_id, action) VALUES ($1, $2)',
          [user.rows[0].id, 'disabled']
        )
      }
    } catch (e) {
      console.log(e);
    }
  }

  static async setAdminStatus(status: boolean, userId: UserId) {
    let res = await db.query(`
        UPDATE users
        SET is_admin = $1
        WHERE telegram_user_id = $2
        RETURNING *`,
      [status, userId]
    )
  }
}