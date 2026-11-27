import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, firstValueFrom, map, of, tap } from 'rxjs';

import { AuthResponse, LoginRequest, MeResponse, RegisterRequest } from '../models/auth.model';
import { Role, User, normalizeUser } from '../models/user.model';

const TOKEN_KEY = 'foodexpress_token';
const USER_KEY = 'foodexpress_user';

// localStorage can be unavailable (private mode, blocked data): never crash because of it
function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    /* ignore */
  }
}

function readStoredUser(): User | null {
  const raw = readStorage(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly tokenState = signal<string | null>(readStorage(TOKEN_KEY));
  private readonly userState = signal<User | null>(readStoredUser());

  readonly token = this.tokenState.asReadonly();
  readonly user = this.userState.asReadonly();
  readonly isLoggedIn = computed(() => !!this.tokenState() && !!this.userState());
  readonly role = computed<Role | null>(() => this.userState()?.role ?? null);
  readonly fullName = computed(() => {
    const user = this.userState();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap((res) => this.setSession(res.token, normalizeUser(res.user))),
      map(() => this.userState() as User)
    );
  }

  register(data: RegisterRequest): Observable<User> {
    return this.http.post<AuthResponse>('/api/auth/register', data).pipe(
      tap((res) => this.setSession(res.token, normalizeUser(res.user))),
      map(() => this.userState() as User)
    );
  }

  /** Reload the current user from the API (GET /api/auth/me). */
  refreshUser(): Observable<User> {
    return this.http.get<MeResponse>('/api/auth/me').pipe(
      map((res) => normalizeUser(res.user)),
      tap((user) => this.setUser(user))
    );
  }

  /** Called once when the app starts: checks that a stored token is still valid. */
  restoreSession(): Promise<unknown> {
    if (!this.tokenState()) {
      return Promise.resolve();
    }
    return firstValueFrom(this.refreshUser().pipe(catchError(() => of(null))));
  }

  /** Update the stored user, for example after the profile form is saved. */
  setUser(user: User): void {
    this.userState.set(user);
    writeStorage(USER_KEY, JSON.stringify(user));
  }

  logout(redirect = true): void {
    this.tokenState.set(null);
    this.userState.set(null);
    writeStorage(TOKEN_KEY, null);
    writeStorage(USER_KEY, null);

    if (redirect) {
      void this.router.navigate(['/login']);
    }
  }

  hasRole(...roles: Role[]): boolean {
    const current = this.userState()?.role;
    return !!current && roles.includes(current);
  }

  /** Space of each role (where to go after login). */
  homeRoute(role: Role | null = this.role()): string {
    switch (role) {
      case 'ADMIN':
        return '/admin-dashboard/users';
      case 'RESTAURANT':
        return '/restaurant-dashboard/dashboard';
      default:
        return '/';
    }
  }

  private setSession(token: string, user: User): void {
    this.tokenState.set(token);
    writeStorage(TOKEN_KEY, token);
    this.setUser(user);
  }
}