# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management
- `bun install` - Install dependencies
- `bun run dev` - Start development server with hot reload (runs on http://localhost:3000)

### Code Quality
- `bun run format` - Format code according to project standards
- `bun run lint` - Run linter checks (read-only)
- `bun run lint:fix` - Auto-fix linting issues
- `bun run check` - Check formatting and linting (read-only)
- `bun run check:fix` - Auto-fix formatting and linting issues
- `bun run check:fix-all` - Auto-fix everything including unsafe changes

### Testing
- `bun test` - Run tests in watch mode
- `bun run test:run` - Run tests once
- `bun run test:ui` - Run tests with UI interface

## Architecture

This is a Hono-based TypeScript backend application using Bun as the runtime and package manager.

### Tech Stack
- **Runtime**: Bun
- **Framework**: Hono (fast web framework)
- **Language**: TypeScript with strict mode enabled
- **Dependency Injection**: Inversify with reflect-metadata
- **Validation**: ArkType for type-safe validation
- **Testing**: Vitest with UI support
- **Code Quality**: Biome (formatter and linter)

### Code Style & Domain Knowledge
Refer to these files when contributing:
- `/Users/senna/Documents/Repos/OOP-cms-dev/backend/claude-memory-bank/.codingrules.md` - Coding guidelines
- `/Users/senna/Documents/Repos/OOP-cms-dev/backend/claude-memory-bank/docs/DOMAIN_CONTEXT.md` - Domain overview
- `/Users/senna/Documents/Repos/OOP-cms-dev/backend/claude-memory-bank/docs/domains/` - Detailed domain specifications

**Key Guidelines:**
- **TDD Mandatory**: Unit tests must be created with every code generation
- **Type Safety Focus**: Use branded types, avoid `any` type
- **DDD Implementation**: Follow Domain-Driven Design patterns
- **Result Types**: Use Result<T, E> instead of throwing errors
- **Pure Functions**: Preferred over classes with side effects
- Tab indentation, double quotes, organized imports (enforced by Biome)

### Project Structure
- `src/index.ts` - Main application entry point with Hono app setup and DI container
- `src/__tests__/` - Test files directory
- `src/domains/content/` - Content domain implementation (DDD structure)
  - `entities/` - Domain entities (Content)
  - `value-objects/` - Value objects (ContentState)
  - `repositories/` - Repository interfaces and implementations
  - `services/` - Domain services with business logic
- `src/infrastructure/di/` - Dependency injection configuration
  - `symbols.ts` - DI symbols for type-safe injection
  - `container.ts` - Inversify container configuration
- `vitest.config.ts` - Vitest configuration
- `claude-memory-bank/` - Claude development resources
  - `CLAUDE.md` - This file with development guidance
  - `.codingrules.md` - Japanese coding guidelines (TDD, DDD, type safety)
  - `docs/` - Domain documentation
    - `DOMAIN_CONTEXT.md` - CMS domain overview
    - `domains/` - Detailed domain specifications
      - `contents.md` - Content domain business rules
- Uses ES modules with TypeScript compilation and decorators

### Domain Context
This is a **Content Management System (CMS)** with four main domains:
1. **Content Management** - Articles, categories, tags, publishing workflow
   - Content states: draft, published, private, archived
   - Role-based editing permissions (Author/Editor/Admin)
   - Scheduled publishing and featured content limits
2. **User & Authentication** - User management, roles, permissions, RBAC
3. **Asset Management** - File uploads, image optimization, CDN integration
4. **Comment & Feedback** - Comment moderation and reviews

**Important Business Rules (from docs/domains/contents.md):**
- Content must have one of four states: draft/published/private/archived
- Published content can only be soft-deleted
- Authors can only edit their own content; Editors can edit all content
- Titles: 5-100 characters, Body: 100+ characters required
- Max 5 featured articles simultaneously

## Implementation Status

### ✅ Content Domain (Completed)
- **Entities**: Content entity with full business logic
- **Value Objects**: ContentState with transition rules
- **Repositories**: Interface + InMemoryContentRepository for testing
- **Services**: ContentService with permission-based operations
- **Testing**: 37 passing tests covering all business rules
- **DI Integration**: Full Inversify setup with proper scoping

### 🔧 Development Setup (Completed)
- **Dependency Injection**: Inversify container with type-safe symbols
- **Code Quality**: Biome with auto-fix commands and parameter decorators
- **Testing Framework**: Vitest with UI support
- **TypeScript**: Strict mode with decorators enabled

### 📝 Next Steps
Ready for:
- User & Authentication domain implementation
- Asset Management domain implementation  
- Comment & Feedback domain implementation
- Database integration (replace InMemoryRepository)
- API controllers and middleware
- Production deployment setup