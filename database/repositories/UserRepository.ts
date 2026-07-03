import db from "../db";
import { UserModel } from "../models/UserModel";

class UserRepository {

    save(user: UserModel) {
        db.withTransactionSync(() => {
            db.runSync(
                `
                    INSERT OR REPLACE INTO users
                    (
                        id,
                        username,
                        email,
                        access_token
                    )
                    VALUES
                    (?, ?, ?, ?)
                `,
                [
                    user.id,
                    user.username,
                    user.email,
                    user.token,
                ]
            );
        });

    }

}

export default new UserRepository();