# Personal Portfolio Website

A modern, responsive personal portfolio website built with Angular and Firebase, featuring clean architecture principles and a custom admin panel for dynamic content management.

## 🚀 Features

- **Clean Architecture**: Organized with Domain, Data, and Presentation layers
- **Dynamic Content Management**: Custom admin panel for updating content without code changes
- **Portfolio Showcase**: Display projects, experience, skills, and achievements
- **Travel Blog**: Share travel experiences and photos
- **Contact Management**: Easy way for visitors to get in touch
- **Responsive Design**: Optimized for all devices
- **Firebase Integration**: Real-time data storage and authentication

## 🛠️ Tech Stack

- **Frontend**: Angular 18+ with Standalone Components
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **UI Library**: Angular Material
- **Styling**: SCSS with modern CSS features
- **Type Safety**: Full TypeScript implementation
- **Architecture**: Clean Architecture with dependency injection

## 📁 Project Structure

```
src/app/
├── domain/              # Business logic layer
│   ├── entities/        # Domain entities
│   ├── repositories/    # Repository interfaces
│   └── use-cases/       # Business use cases
├── data/                # Data access layer
│   ├── repositories/    # Repository implementations
│   └── datasources/     # Data sources (Firebase)
├── presentation/        # Presentation layer
│   ├── pages/          # Page components
│   ├── components/     # Reusable components
│   └── admin/          # Admin panel
├── core/               # Core services and utilities
└── shared/             # Shared components and utilities
```

## 🔧 Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## 🔥 Firebase Setup

This project uses Firebase for backend services. To set up Firebase:

1. **Quick Setup**: Follow the detailed guide in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
2. **Update Configuration**: Replace the placeholder values in `src/environments/environment.ts` with your Firebase configuration
3. **Create Admin User**: Set up an admin user in Firebase Authentication with custom claims
4. **Deploy Rules**: Use `firebase deploy --only firestore:rules,storage` to deploy security rules

### Admin Panel Access

- Navigate to `/admin/login`
- Use your Firebase admin credentials
- Access the dashboard to manage content dynamically

## 🏗️ Project Features

- **Dynamic Content Management**: Update all content through the admin panel
- **Firebase Integration**: Real-time data synchronization
- **Authentication**: Secure admin access with Firebase Auth
- **File Upload**: Image and document management with Firebase Storage
- **Responsive Design**: Optimized for all devices
- **SEO Optimized**: Meta tags and structured data

## 🔧 Development server

## 🔨 Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
