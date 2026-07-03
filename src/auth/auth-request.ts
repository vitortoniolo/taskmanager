import { Request } from 'express';
import { User } from '../users/entities/user.entity';

// requisição autenticada: o jwt guard coloca o usuário logado em req.user
export interface AuthRequest extends Request {
  user: User;
}
