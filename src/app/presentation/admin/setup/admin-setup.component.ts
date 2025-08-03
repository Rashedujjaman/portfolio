import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSetupService } from '../../../core/admin-setup.service';

@Component({
  selector: 'app-admin-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="setup-container">
      <div class="setup-card">
        <h1>Admin Setup</h1>
        <p class="subtitle">Set admin privileges for Firebase users</p>
        
        <div class="setup-form">
          <div class="form-group">
            <label for="email">User Email:</label>
            <input 
              type="email" 
              id="email" 
              [(ngModel)]="email" 
              placeholder="Enter user email"
              class="form-control">
          </div>
          
          <div class="form-group">
            <label>
              <input 
                type="checkbox" 
                [(ngModel)]="isAdmin"
                class="checkbox"> 
              Grant Admin Privileges
            </label>
          </div>
          
          <button 
            (click)="setAdminClaim()" 
            [disabled]="!email || isLoading"
            class="btn btn-primary">
            {{ isLoading ? 'Setting...' : 'Set Admin Claim' }}
          </button>
        </div>
        
        <div class="users-section">
          <h3>Current Users</h3>
          <button 
            (click)="loadUsers()" 
            [disabled]="isLoadingUsers"
            class="btn btn-secondary">
            {{ isLoadingUsers ? 'Loading...' : 'Refresh Users' }}
          </button>
          
          <div class="users-list" *ngIf="users.length > 0">
            <div class="user-item" *ngFor="let user of users">
              <div class="user-info">
                <strong>{{ user.email }}</strong>
                <small>{{ user.uid }}</small>
              </div>
              <div class="user-claims">
                <span class="admin-badge" [class.active]="user.customClaims?.admin">
                  {{ user.customClaims?.admin ? 'Admin' : 'User' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="status-message" *ngIf="statusMessage">
          <div class="alert" [class.success]="isSuccess" [class.error]="!isSuccess">
            {{ statusMessage }}
          </div>
        </div>
        
        <div class="instructions">
          <h3>Setup Instructions:</h3>
          
          <div class="method-tabs">
            <h4>🚀 Method 1: Manual Script (Recommended)</h4>
            <ol>
              <li>Open <code>set-admin-claims.js</code> in your project root</li>
              <li>Update the email: <code>const userEmail = 'your-email&#64;example.com';</code></li>
              <li>Run these commands:
                <div class="code-block">
                  <code>npm install firebase-admin</code><br>
                  <code>firebase login</code><br>
                  <code>node set-admin-claims.js</code>
                </div>
              </li>
              <li>✅ You can now login to the admin dashboard!</li>
            </ol>
          </div>

          <div class="method-tabs">
            <h4>⚙️ Method 2: Cloud Functions (If you prefer web interface)</h4>
            <ol>
              <li>Deploy Cloud Functions: <code>firebase deploy --only functions</code></li>
              <li>Wait for deployment to complete</li>
              <li>Enter your email above and click "Set Admin Claim"</li>
              <li>Remove this setup page in production</li>
            </ol>
          </div>

          <div class="method-tabs">
            <h4>🧪 Method 3: Temporary Testing</h4>
            <p>For quick testing, you can temporarily disable admin checks:</p>
            <ol>
              <li>Open <code>src/app/core/auth.service.ts</code></li>
              <li>Comment out lines 38-42 (admin privilege check)</li>
              <li>Login to test the dashboard</li>
              <li>⚠️ Remember to restore the check after setting admin claims!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .setup-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      padding: 2rem;
    }
    
    .setup-card {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      max-width: 600px;
      width: 100%;
    }
    
    h1 {
      color: #333;
      margin-bottom: 0.5rem;
    }
    
    .subtitle {
      color: #666;
      margin-bottom: 2rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    .checkbox {
      margin-right: 0.5rem;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.3s;
    }
    
    .btn-primary {
      background: #007bff;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
      margin-bottom: 1rem;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .users-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #eee;
    }
    
    .user-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 1px solid #eee;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }
    
    .user-info strong {
      display: block;
    }
    
    .user-info small {
      color: #666;
      font-family: monospace;
    }
    
    .admin-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      background: #f8f9fa;
      color: #6c757d;
    }
    
    .admin-badge.active {
      background: #d4edda;
      color: #155724;
    }
    
    .status-message {
      margin-top: 1rem;
    }
    
    .alert {
      padding: 1rem;
      border-radius: 4px;
    }
    
    .alert.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    
    .alert.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    
    .instructions {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #eee;
    }
    
    .instructions ol {
      padding-left: 1.5rem;
    }
    
    .instructions li {
      margin-bottom: 0.5rem;
    }
    
    code {
      background: #f8f9fa;
      padding: 0.25rem 0.5rem;
      border-radius: 3px;
      font-family: monospace;
    }
    
    .method-tabs {
      margin-bottom: 2rem;
      padding: 1rem;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      background: #f8f9fa;
    }
    
    .method-tabs h4 {
      color: #495057;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #dee2e6;
    }
    
    .code-block {
      background: #343a40;
      color: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      margin: 0.5rem 0;
      font-family: monospace;
      overflow-x: auto;
    }
    
    .code-block code {
      background: transparent;
      color: inherit;
      padding: 0;
    }
  `]
})
export class AdminSetupComponent {
  email = '';
  isAdmin = true;
  isLoading = false;
  isLoadingUsers = false;
  statusMessage = '';
  isSuccess = false;
  users: any[] = [];

  constructor(private adminSetupService: AdminSetupService) {}

  setAdminClaim() {
    if (!this.email) return;
    
    this.isLoading = true;
    this.statusMessage = '';
    
    this.adminSetupService.setAdminClaim(this.email, this.isAdmin).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isSuccess = true;
        this.statusMessage = response.message || 'Admin claim set successfully!';
        this.loadUsers(); // Refresh the users list
      },
      error: (error) => {
        this.isLoading = false;
        this.isSuccess = false;
        this.statusMessage = error.error?.error || 'Failed to set admin claim. Make sure Cloud Functions are deployed.';
      }
    });
  }

  loadUsers() {
    this.isLoadingUsers = true;
    
    this.adminSetupService.listUsers().subscribe({
      next: (response) => {
        this.isLoadingUsers = false;
        this.users = response.users || [];
      },
      error: (error) => {
        this.isLoadingUsers = false;
        console.error('Failed to load users:', error);
      }
    });
  }
}
