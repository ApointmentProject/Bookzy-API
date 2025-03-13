import User from "../models/user.model";
import { encryptData, decryptData, hashPassword } from "../utils/cypher";

export const encryptUser = async (
    user: User
): Promise<User> => {
    return {
        ...user,
        email: encryptData(user.email),
        phone_number: encryptData(user.phone_number),
        password_hash: await hashPassword(user.password_hash),
    }
}

export const decryptUser = (user: User): User => {
    return {
        ...user,
        email: decryptData(user.email),
        phone_number: decryptData(user.phone_number),
    }
}