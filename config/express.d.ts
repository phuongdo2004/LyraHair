import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      flash(type: string, message: any): void;
      flash(type: string): any;
      flash(): { [key: string]: any[] };
    }
  }
}