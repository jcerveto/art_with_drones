import dotenv from 'dotenv';

dotenv.config();

const authFailedMsg = {
    error: 'Auth failed. '
}
export const AuthFailed: string = `${JSON.stringify(authFailedMsg)}`;