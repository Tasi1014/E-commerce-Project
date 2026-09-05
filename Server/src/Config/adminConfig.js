import dotenv from 'dotenv';
dotenv.config();

export const admin = {
    get email() {
        return (process.env.ADMIN_EMAIL || '').trim();
    },
    get password() {
        return (process.env.ADMIN_PASSWORD || '').trim();
    }
};