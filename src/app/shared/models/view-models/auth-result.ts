import { User } from '../entities/user';

export interface AuthResult {
    user: User;
    token: string;
}
