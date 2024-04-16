/* eslint-disable @typescript-eslint/no-unused-vars */
// custom.d.ts
import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      txId?: string;
    }
    interface Response {
      sendResponse: (code: number, result?: unknown) => Response;
    }
  }
}
