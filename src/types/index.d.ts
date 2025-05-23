declare module 'express' {
  interface Request {
    rawBody?: Buffer;
  }
}
