import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'default_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

export const MongoConfig = {
  url: process.env.MONGODB_URL
}