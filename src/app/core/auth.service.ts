import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
  
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  public isAdmin$ = this.isAdminSubject.asObservable();

  constructor(
    private auth: Auth,
    private router: Router
  ) {
    // Listen to authentication state changes
    onAuthStateChanged(this.auth, async (user) => {
      this.userSubject.next(user);
      
      if (user) {
        // Check if user has admin privileges
        const tokenResult = await user.getIdTokenResult();
        const isAdmin = !!tokenResult.claims['admin'];
        this.isAdminSubject.next(isAdmin);
      } else {
        this.isAdminSubject.next(false);
      }
    });
  }

  async loginWithEmailAndPassword(email: string, password: string): Promise<void> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      const tokenResult = await credential.user.getIdTokenResult();
      
      // Check if user has admin privileges
      if (!tokenResult.claims['admin']) {
        await this.logout();
        throw new Error('Access denied. Admin privileges required.');
      }
      
      this.router.navigate(['/admin/dashboard']);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/admin/login']);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }

  isAdminUser(): boolean {
    return this.isAdminSubject.value;
  }
}
