<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Portfolio Website Project Instructions

This is an Angular personal portfolio website project using clean architecture principles with Firebase as the backend. 

## Architecture
- **Domain Layer**: Contains entities, repositories interfaces, and use cases
- **Data Layer**: Contains repository implementations and data sources (Firebase)
- **Presentation Layer**: Contains Angular components, pages, and admin interface

## Key Technologies
- Angular 18+ with standalone components
- Firebase for data storage and authentication
- Angular Material for UI components
- SCSS for styling
- TypeScript for type safety

## Project Structure
- `src/app/domain/`: Business logic and entities
- `src/app/data/`: Data access implementations
- `src/app/presentation/`: UI components and pages
- `src/app/core/`: Core services and utilities
- `src/app/shared/`: Shared components and utilities

## Features
- Personal portfolio showcase
- Dynamic content management via admin panel
- Project portfolio display
- Experience and education timeline
- Travel blog/gallery
- Contact information
- Responsive design

## Development Guidelines
- Follow clean architecture principles
- Use dependency injection for repository implementations
- Implement proper error handling
- Use reactive programming with RxJS
- Maintain type safety throughout the application
- Follow Angular style guide conventions

## Admin Panel
The project includes a custom admin panel for dynamic content management, allowing updates without code changes.

When generating code, prioritize:
1. Type safety
2. Reactive programming patterns
3. Clean architecture separation
4. Reusable components
5. Responsive design
6. Performance optimization
