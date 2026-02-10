import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Release, Component, ScanStatus, SignOffStatus, Team, UserStory, QAStatus } from '../models/release.model';
import { Observable, of, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { MOCK_RELEASES } from '../data/mock-releases';
import { API_BASE_URL } from '../config';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ReleaseService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${API_BASE_URL}/releases`;
  private apiTeamUrl = `${API_BASE_URL}/teams`;

  private releasesState = signal<Release[]>(MOCK_RELEASES);

  releases = this.releasesState.asReadonly();
  
  constructor() {
    this.loadReleases().subscribe();
  }

  private loadReleases(): Observable<Release[]> {
    return this.http.get<Release[]>(this.apiUrl).pipe(
      tap(releases => this.releasesState.set(releases))
    );
  }
  
  getAllTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiTeamUrl);
  }

  getReleaseById(id: string): Observable<Release | undefined> {
    return toObservable(this.releasesState).pipe(
      map(releases => releases.find(r => r.id === id)),
      tap(release => {
        // If the release is not found in the current state (e.g., direct navigation),
        // fetch it from the API to populate the state.
        if (!release) {
          this.http.get<Release>(`${this.apiUrl}/${id}`).subscribe(fetchedRelease => {
            this.releasesState.update(allReleases => {
              if (!allReleases.some(r => r.id === fetchedRelease.id)) {
                return [...allReleases, fetchedRelease];
              }
              return allReleases;
            });
          });
        }
      })
    );
  }
  
  updateComponentScan(releaseId: string, teamId: string, componentId: string, scanType: 'sonarQube' | 'nexusIq' | 'checkmarx', status: ScanStatus) {
    const url = `${this.apiUrl}/${releaseId}/teams/${teamId}/components/${componentId}/scan`;
    this.http.put<Component>(url, { scanType, status }).subscribe(updatedComponent => {
        this.releasesState.update(releases =>
            releases.map(r => r.id === releaseId ? this.updateComponentInRelease(r, teamId, updatedComponent) : r)
        );
    });
  }

  updateTeamQASignOff(releaseId: string, teamId: string, status: SignOffStatus) {
    const url = `${this.apiUrl}/${releaseId}/teams/${teamId}/qa-signoff`;
    this.http.put<Team>(url, { qaSignedOff: status }).subscribe(updatedTeam => {
      this.updateTeamInState(releaseId, updatedTeam);
    });
  }

  updateTeamAppOwnerSignOff(releaseId: string, teamId: string, status: SignOffStatus) {
    const url = `${this.apiUrl}/${releaseId}/teams/${teamId}/appowner-signoff`;
    this.http.put<Team>(url, { appOwnerSignedOff: status }).subscribe(updatedTeam => {
      this.updateTeamInState(releaseId, updatedTeam);
    });
  }
  
  updateOverallReleaseSignOff(releaseId: string, status: SignOffStatus) {
    const url = `${this.apiUrl}/${releaseId}/overall-signoff`;
    this.http.put<Release>(url, { overallAppOwnerSignedOff: status }).subscribe(updatedRelease => {
        this.releasesState.update(releases =>
            releases.map(r => r.id === releaseId ? updatedRelease : r)
        );
        if (status === 'Completed') {
            this.sendApprovalNotification(releaseId).subscribe();
        }
    });
  }

  sendApprovalNotification(releaseId: string): Observable<void> {
    const url = `${this.apiUrl}/${releaseId}/notify`;
    return this.http.post<void>(url, {});
  }

  addTeamComponent(releaseId: string, teamId: string, componentData: { name: string, version: string }): Observable<Component> {
    const url = `${this.apiUrl}/${releaseId}/teams/${teamId}/components`;
    return this.http.post<Component>(url, componentData).pipe(
      tap(newComponent => {
        this.releasesState.update(releases =>
          releases.map(release => {
            if (release.id === releaseId) {
              return {
                ...release,
                teams: release.teams.map(team => {
                  if (team.id === teamId) {
                    return { ...team, components: [...team.components, newComponent] };
                  }
                  return team;
                })
              };
            }
            return release;
          })
        );
      })
    );
  }

  deleteComponent(releaseId: string, teamId: string, componentId: string): void {
    const url = `${this.apiUrl}/${releaseId}/teams/${teamId}/components/${componentId}`;
    this.http.delete(url).subscribe(() => {
      this.releasesState.update(releases => releases.map(r => {
        if (r.id === releaseId) {
          return {
            ...r,
            teams: r.teams.map(t => {
              if (t.id === teamId) {
                return {
                  ...t,
                  components: t.components.filter(c => c.id !== componentId)
                };
              }
              return t;
            })
          };
        }
        return r;
      }));
    });
  }

  addRelease(newReleaseData: { name: string; version: string; releaseDate: string; teamIds: string[] }): Observable<Release> {
      return this.http.post<Release>(this.apiUrl, newReleaseData).pipe(
        tap(newRelease => {
          this.releasesState.update(releases => [newRelease, ...releases]);
        })
      );
  }

  addUserStory(releaseId: string, teamId: string, storyData: { description: string, componentIds: string[] }): Observable<UserStory> {
    const url = `${this.apiUrl}/${releaseId}/teams/${teamId}/user-stories`;
    return this.http.post<UserStory>(url, storyData).pipe(
      tap(newUserStory => {
        this.releasesState.update(releases =>
          releases.map(release => {
            if (release.id === releaseId) {
              return {
                ...release,
                teams: release.teams.map(team => {
                  if (team.id === teamId) {
                    // Ensure userStories array exists
                    const existingStories = team.userStories || [];
                    return { ...team, userStories: [...existingStories, newUserStory] };
                  }
                  return team;
                })
              };
            }
            return release;
          })
        );
      })
    );
  }

  deleteUserStory(releaseId: string, teamId: string, storyId: string): void {
    const url = `${this.apiUrl}/${releaseId}/teams/${teamId}/user-stories/${storyId}`;
    this.http.delete(url).subscribe(() => {
      this.releasesState.update(releases => releases.map(r => {
        if (r.id === releaseId) {
          return {
            ...r,
            teams: r.teams.map(t => {
              if (t.id === teamId) {
                return {
                  ...t,
                  userStories: t.userStories.filter(us => us.id !== storyId)
                };
              }
              return t;
            })
          };
        }
        return r;
      }));
    });
  }

  updateUserStoryQAStatus(releaseId: string, teamId: string, storyId: string, qaStatus: QAStatus): void {
    const url = `${this.apiUrl}/${releaseId}/teams/${teamId}/user-stories/${storyId}/qa-status`;
    this.http.put<UserStory>(url, { qaStatus }).subscribe(updatedUserStory => {
      this.releasesState.update(releases =>
        releases.map(release => {
          if (release.id === releaseId) {
            return {
              ...release,
              teams: release.teams.map(team => {
                if (team.id === teamId) {
                  return {
                    ...team,
                    userStories: team.userStories.map(story => story.id === storyId ? updatedUserStory : story)
                  };
                }
                return team;
              })
            };
          }
          return release;
        })
      );
    });
  }

  addTeam(releaseId: string, teamData: { name: string; teamDl: string; productOwner: string; }): Observable<Team> {
    const url = `${this.apiUrl}/${releaseId}/teams`;
    return this.http.post<Team>(url, teamData).pipe(
      tap(newTeam => {
        this.authService.addTeamMembershipToDeveloper(newTeam.id);
        this.releasesState.update(releases =>
          releases.map(release => {
            if (release.id === releaseId) {
              return { ...release, teams: [...release.teams, newTeam] };
            }
            return release;
          })
        );
      })
    );
  }

  updateTeamDetails(releaseId: string, teamId: string, data: { name: string; teamDl: string; productOwner: string; }): void {
    const url = `${this.apiUrl}/${releaseId}/teams/${teamId}`;
    this.http.put<Team>(url, data).subscribe(updatedTeam => {
      this.updateTeamInState(releaseId, updatedTeam);
    });
  }

  deleteTeam(releaseId: string, teamId: string): void {
    const url = `${this.apiUrl}/${releaseId}/teams/${teamId}`;
    this.http.delete(url).subscribe(() => {
      this.releasesState.update(releases =>
        releases.map(release => {
          if (release.id === releaseId) {
            return { ...release, teams: release.teams.filter(team => team.id !== teamId) };
          }
          return release;
        })
      );
    });
  }

  updateReleaseDetails(releaseId: string, data: { name: string; version: string; releaseDate: string; }): Observable<Release> {
    const url = `${this.apiUrl}/${releaseId}`;
    return this.http.put<Release>(url, data).pipe(
      tap(updatedRelease => {
        this.releasesState.update(releases =>
          releases.map(r => (r.id === releaseId ? { ...r, ...updatedRelease } : r))
        );
      })
    );
  }

  deleteRelease(releaseId: string): void {
    const url = `${this.apiUrl}/${releaseId}`;
    this.http.delete(url).subscribe(() => {
      this.releasesState.update(releases => releases.filter(r => r.id !== releaseId));
    });
  }

  updateComponentDetails(releaseId: string, teamId: string, componentId: string, data: { name: string; version: string; }): void {
    const url = `${this.apiUrl}/${releaseId}/teams/${teamId}/components/${componentId}`;
    this.http.put<Component>(url, data).subscribe(updatedComponent => {
      this.releasesState.update(releases =>
        releases.map(r => (r.id === releaseId ? this.updateComponentInRelease(r, teamId, updatedComponent) : r))
      );
    });
  }

  updateUserStoryDetails(releaseId: string, teamId: string, storyId: string, data: { description: string; }): void {
    const url = `${this.apiUrl}/${releaseId}/teams/${teamId}/user-stories/${storyId}`;
    this.http.put<UserStory>(url, data).subscribe(updatedStory => {
      this.releasesState.update(releases =>
        releases.map(r => {
          if (r.id === releaseId) {
            return {
              ...r,
              teams: r.teams.map(t => {
                if (t.id === teamId) {
                  return {
                    ...t,
                    userStories: t.userStories.map(s => (s.id === storyId ? { ...s, ...updatedStory } : s))
                  };
                }
                return t;
              })
            };
          }
          return r;
        })
      );
    });
  }

  // Helper function to update a team within a release in the state
  private updateTeamInState(releaseId: string, updatedTeam: Team): void {
    this.releasesState.update(releases =>
      releases.map(release => {
        if (release.id === releaseId) {
          return {
            ...release,
            teams: release.teams.map(team => team.id === updatedTeam.id ? { ...team, ...updatedTeam } : team)
          };
        }
        return release;
      })
    );
  }
  
  // Helper function to update a component within a team in a release
  private updateComponentInRelease(release: Release, teamId: string, updatedComponent: Component): Release {
    return {
      ...release,
      teams: release.teams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            components: team.components.map(c => c.id === updatedComponent.id ? updatedComponent : c)
          };
        }
        return team;
      })
    };
  }
}