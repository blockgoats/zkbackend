declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      username: string;
      type?: 'access' | 'refresh';
    };
  }
}