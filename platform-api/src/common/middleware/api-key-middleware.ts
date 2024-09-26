import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const API_KEY = 'super-secret-api-key';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.header('x-api-key');
    if (apiKey && apiKey === API_KEY) {
      next();
    } else {
      throw new UnauthorizedException('Invalid API key');
    }
  }
}