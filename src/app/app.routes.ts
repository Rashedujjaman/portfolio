import { Routes } from '@angular/router';
import { AdminGuard } from './core/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { 
    path: 'home', 
    loadComponent: () => import('./presentation/pages/home/home').then(c => c.Home)
  },
  { 
    path: 'about', 
    loadComponent: () => import('./presentation/pages/home/home').then(c => c.Home)
  },
  { 
    path: 'projects', 
    loadComponent: () => import('./presentation/pages/projects/projects').then(c => c.Projects)
  },
  { 
    path: 'experience', 
    loadComponent: () => import('./presentation/pages/experience/experience').then(c => c.Experience)
  },
  { 
    path: 'travel', 
    loadComponent: () => import('./presentation/pages/travel/travel').then(c => c.Travel)
  },
  { 
    path: 'contact', 
    loadComponent: () => import('./presentation/pages/contact/contact').then(c => c.Contact)
  },
  {
    path: 'admin',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { 
        path: 'login', 
        loadComponent: () => import('./presentation/admin/login/login').then(c => c.Login)
      },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./presentation/admin/dashboard/dashboard').then(c => c.Dashboard),
        canActivate: [AdminGuard]
      },
      {
        path: 'profile',
        loadComponent: () => import('./presentation/admin/profile/profile').then(c => c.AdminProfile),
        canActivate: [AdminGuard]
      },
      {
        path: 'projects',
        loadComponent: () => import('./presentation/admin/projects/projects').then(c => c.AdminProjects),
        canActivate: [AdminGuard]
      }
    ]
  },
  { path: '**', redirectTo: '/home' }
];
