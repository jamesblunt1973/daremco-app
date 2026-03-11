import { UserPlan } from './user-plan';

export interface User {
    id: number;
    gender: boolean;
    name: string;
    cell: string;
    userPlans: UserPlan[];
}
