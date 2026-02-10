import { Injectable, signal, computed } from '@angular/core';
import { Role, User } from '../models/auth.model';

let USERS: Record<Role, User> = {
    // A developer who is part of 'alpha-squad' (from backend) and 'mock-alpha-squad' (from mock data)
    Developer: { role: 'Developer', roleName: 'Developer', teamIds: ['alpha-squad', 'mock-alpha-squad'] },
    ReleaseManager: { role: 'ReleaseManager', roleName: 'Release Manager' },
    ApplicationOwner: { role: 'ApplicationOwner', roleName: 'Application Owner' },
};

@Injectable({ providedIn: 'root' })
export class AuthService {
    private currentUserState = signal<User | null>(null);

    currentUser = this.currentUserState.asReadonly();
    
    login(role: Role): void {
        this.currentUserState.set(USERS[role]);
    }

    logout(): void {
        this.currentUserState.set(null);
    }

    addTeamMembershipToDeveloper(teamId: string): void {
        const devUser = USERS.Developer;
        // Ensure teamIds array exists
        if (!devUser.teamIds) {
            devUser.teamIds = [];
        }

        // Add teamId if it's not already there
        if (!devUser.teamIds.includes(teamId)) {
            devUser.teamIds.push(teamId);
        }

        // If the current logged-in user is the developer, update their session state too.
        this.currentUserState.update(currentUser => {
            if (currentUser && currentUser.role === 'Developer') {
                // Return a new object for signal change detection, with the updated team list
                return { ...USERS.Developer };
            }
            return currentUser;
        });
    }

    hasRole(roles: Role[]): boolean {
        const current = this.currentUser();
        if (!current) {
            return false;
        }
        return roles.includes(current.role);
    }

    isMemberOfTeam(teamId: string): boolean {
        const current = this.currentUser();
        if (!current || current.role !== 'Developer' || !current.teamIds) {
            return false;
        }
        return current.teamIds.includes(teamId);
    }
}