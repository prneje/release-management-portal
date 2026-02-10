

export type Role = 'Developer' | 'ReleaseManager' | 'ApplicationOwner';

export interface User {
    role: Role;
    roleName: string;
    teamIds?: string[];
}