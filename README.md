# Digital Library & Course Management System

A full-stack platform that allows users to browse, borrow books, and enroll in courses with role-based access control (free vs. premium). The backend is built with TypeScript/Node.js/Express using a clean layered architecture, backed by PostgreSQL (Neon), with JWT authentication. The frontend is React (TSX) + Tailwind CSS.

## Project Structure

```
SD_Project/
├── backend/        # Node.js + TypeScript + Express + Prisma
└── frontend/       # React (TSX) + Tailwind CSS
```

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, TypeScript, Express |
| ORM | Prisma |
| Database | PostgreSQL (Neon) |
| Auth | JWT + bcrypt |
| Frontend | React (TSX), Tailwind CSS |
| Validation | Zod |

## Architecture

```mermaid
graph TD
    Client["React Frontend (TSX + Tailwind)"]
    API["Express API (Node.js + TypeScript)"]
    Auth["Auth Middleware (JWT)"]
    Controllers["Controllers Layer"]
    Services["Services Layer"]
    Repositories["Repositories Layer"]
    DB["PostgreSQL Database"]

    Client -->|HTTP/REST| API
    API --> Auth
    Auth --> Controllers
    Controllers --> Services
    Services --> Repositories
    Repositories --> DB
```

### Layer Responsibilities

- controllers — parse HTTP requests, validate input, delegate to services, return responses
- services — enforce business rules (availability, access control, enrollment logic)
- repositories — execute Prisma queries, map rows to domain models
- models — OOP class hierarchy (Resource → Book / Course)
- routes — bind HTTP verbs + paths to controller methods
- config — database pool setup, environment config

## Core Features

- Users can search books & courses
- Users can borrow books (availability check, max 3 concurrent borrows)
- Users can enroll in courses (progress tracking 0–100%)
- Free vs Premium access control
- JWT-based register/login authentication

## Database Schema

```
users
resources (base table)
books       → extends resources
courses     → extends resources
borrow_records
enrollments
```

## OOP Design

```typescript
abstract class Resource {
  id, title, description, type, isPremium, createdAt, updatedAt
  abstract getDisplayInfo(): ResourceDisplayInfo
}

class Book extends Resource {
  author, isbn, availableCopies, totalCopies
  isAvailable(): boolean
}

class Course extends Resource {
  instructor, durationHours, modules
  getTotalModules(): number
}
```

## System Flows

### Borrow Book Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant Auth as JWT Middleware
    participant BC as BookController
    participant BS as BookService
    participant DB as PostgreSQL

    C->>Auth: POST /api/books/:id/borrow (Bearer token)
    Auth-->>BC: decoded userId
    BC->>BS: borrowBook(userId, bookId)
    BS->>BS: checkAvailability + checkBorrowLimit + checkPremiumAccess
    BS->>DB: INSERT borrow_record + DECREMENT available_copies
    BS-->>BC: BorrowRecord
    BC-->>C: 201 { borrowRecord }
```

### Course Enrollment Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant Auth as JWT Middleware
    participant CC as CourseController
    participant CS as CourseService
    participant DB as PostgreSQL

    C->>Auth: POST /api/courses/:id/enroll (Bearer token)
    Auth-->>CC: decoded userId
    CC->>CS: enrollUser(userId, courseId)
    CS->>CS: checkPremiumAccess + checkDuplicateEnrollment
    CS->>DB: INSERT enrollment
    CS-->>CC: Enrollment
    CC-->>C: 201 { enrollment }
```

## API Endpoints (Planned)

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login + get JWT |
| GET | /api/books | Search books |
| POST | /api/books/:id/borrow | Borrow a book |
| POST | /api/books/:id/return | Return a book |
| GET | /api/courses | Search courses |
| POST | /api/courses/:id/enroll | Enroll in course |
| PATCH | /api/courses/:id/progress | Update progress |

## Business Rules

- Max 3 active borrows per user at any time
- Premium resources only accessible to premium/admin users
- Duplicate borrow or enrollment not allowed
- Progress percent must be in range [0, 100]
- On progress = 100, enrollment status auto-set to `completed`

## Getting Started

```bash
# Backend
cd backend
npm install
cp .env.example .env   # add your DATABASE_URL and JWT_SECRET
npm run db:generate
npm run dev
```

## Environment Variables

```env
DATABASE_URL=your_neon_postgresql_url
JWT_SECRET=your_jwt_secret
PORT=3000
```

## Class Diagram

```mermaid
classDiagram
    direction TB

    class User {
        +String id
        +String username
        +String email
        +String passwordHash
        +Role role
        +DateTime createdAt
    }

    class Resource {
        +String id
        +String title
        +String description
        +ResourceType type
        +String category
        +Json tags
        +Boolean isPremium
        +DateTime createdAt
        +DateTime updatedAt
    }

    class Book {
        +String id
        +String author
        +String isbn
        +Int availableCopies
        +Int totalCopies
        +isAvailable() Boolean
    }

    class Course {
        +String id
        +String instructor
        +Int durationHours
        +Json modules
        +getTotalModules() Int
    }

    class BorrowRecord {
        +String id
        +String userId
        +String bookId
        +DateTime borrowedAt
        +DateTime dueDate
        +DateTime returnedAt
        +BorrowStatus status
    }

    class Enrollment {
        +String id
        +String userId
        +String courseId
        +DateTime enrolledAt
        +Int progressPercent
        +DateTime completedAt
        +EnrollmentStatus status
    }

    class CourseModuleProgress {
        +String id
        +String enrollmentId
        +String moduleId
        +Int moduleIndex
        +String title
        +Boolean completed
        +DateTime completedAt
    }

    class LearningPath {
        +String id
        +String title
        +String description
        +String slug
        +LearningDifficulty difficulty
        +Int estimatedHours
        +Json tags
        +Boolean isPremium
    }

    class LearningPathItem {
        +String id
        +String learningPathId
        +String resourceId
        +Int position
        +String notes
    }

    class UserLearningPath {
        +String id
        +String userId
        +String learningPathId
        +DateTime startedAt
        +DateTime completedAt
        +UserLearningPathStatus status
        +Int progressPercent
        +Json completedItemIds
    }

    class BaseWorkflow~TInput TOutput~ {
        <<abstract>>
        +run(input: TInput) TOutput
        #validate(input: TInput) void
        #execute(input: TInput) TOutput
        #postProcess(input, result) void
    }

    class BorrowWorkflow {
        #validate(input) void
        #execute(input) BorrowRecord
        #postProcess(input, result) void
    }

    class ReturnWorkflow {
        #validate(input) void
        #execute(input) BorrowRecord
        #postProcess(input, result) void
    }

    class EnrollWorkflow {
        #validate(input) void
        #execute(input) Enrollment
        #postProcess(input, result) void
    }

    class ResourceAccessProxy {
        -RealResourceService real
        +getById(id, userId) Resource
        +getAll(params, userId) ResourceList
        -checkPremiumAccess(userId) void
        -getUserRole(userId) String
    }

    %% Inheritance
    Resource <|-- Book : extends
    Resource <|-- Course : extends
    BaseWorkflow <|-- BorrowWorkflow : extends
    BaseWorkflow <|-- ReturnWorkflow : extends
    BaseWorkflow <|-- EnrollWorkflow : extends

    %% Associations
    User "1" --> "0..*" BorrowRecord : has
    User "1" --> "0..*" Enrollment : has
    User "1" --> "0..*" UserLearningPath : has

    Book "1" --> "0..*" BorrowRecord : referenced in
    Course "1" --> "0..*" Enrollment : referenced in
    Enrollment "1" --> "0..*" CourseModuleProgress : tracks

    LearningPath "1" --> "0..*" LearningPathItem : contains
    LearningPath "1" --> "0..*" UserLearningPath : enrolled via
    Resource "1" --> "0..*" LearningPathItem : included in

    ResourceAccessProxy ..> Resource : proxies
```

## Use Case Diagram

```mermaid
graph TB
    subgraph Actors
        Guest(["👤 Guest"])
        FreeUser(["👤 Free User"])
        PremiumUser(["👤 Premium User"])
        Admin(["👤 Admin"])
    end

    subgraph Authentication
        UC1["Register"]
        UC2["Login with Email & Password"]
        UC3["Login with Google OAuth"]
        UC4["Logout"]
    end

    subgraph Books
        UC5["Browse & Search Books"]
        UC6["View Book Details"]
        UC7["Borrow Book"]
        UC8["Return Book"]
        UC9["View Active Borrows"]
        UC10["View Borrow History"]
        UC11["Borrow Premium Book"]
    end

    subgraph Courses
        UC12["Browse Courses"]
        UC13["Enroll in Course"]
        UC14["Update Course Progress"]
        UC15["Complete Course Module"]
        UC16["View My Enrollments"]
        UC17["Enroll in Premium Course"]
    end

    subgraph "Learning Paths"
        UC18["Browse Learning Paths"]
        UC19["View Learning Path Details"]
        UC20["Start Learning Path"]
        UC21["Mark Path Item Complete"]
        UC22["View My Learning Paths"]
        UC23["Access Premium Learning Path"]
    end

    subgraph Recommendations
        UC24["Get Personalized Recommendations"]
    end

    %% Guest access
    Guest --> UC1
    Guest --> UC2
    Guest --> UC3
    Guest --> UC5
    Guest --> UC6
    Guest --> UC12
    Guest --> UC18
    Guest --> UC19

    %% Free User inherits Guest + more
    FreeUser --> UC4
    FreeUser --> UC5
    FreeUser --> UC6
    FreeUser --> UC7
    FreeUser --> UC8
    FreeUser --> UC9
    FreeUser --> UC10
    FreeUser --> UC12
    FreeUser --> UC13
    FreeUser --> UC14
    FreeUser --> UC15
    FreeUser --> UC16
    FreeUser --> UC18
    FreeUser --> UC19
    FreeUser --> UC20
    FreeUser --> UC21
    FreeUser --> UC22
    FreeUser --> UC24

    %% Premium User inherits Free User + premium access
    PremiumUser --> UC11
    PremiumUser --> UC17
    PremiumUser --> UC23
    PremiumUser --> UC4
    PremiumUser --> UC5
    PremiumUser --> UC6
    PremiumUser --> UC7
    PremiumUser --> UC8
    PremiumUser --> UC9
    PremiumUser --> UC10
    PremiumUser --> UC12
    PremiumUser --> UC13
    PremiumUser --> UC14
    PremiumUser --> UC15
    PremiumUser --> UC16
    PremiumUser --> UC18
    PremiumUser --> UC19
    PremiumUser --> UC20
    PremiumUser --> UC21
    PremiumUser --> UC22
    PremiumUser --> UC24

    %% Admin inherits all
    Admin --> UC11
    Admin --> UC17
    Admin --> UC23
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
    Admin --> UC15
    Admin --> UC16
    Admin --> UC18
    Admin --> UC19
    Admin --> UC20
    Admin --> UC21
    Admin --> UC22
    Admin --> UC24

    %% Business rule notes
    UC7 -. "max 3 concurrent" .-> UC7
    UC11 -. "requires PREMIUM role" .-> UC11
    UC17 -. "requires PREMIUM role" .-> UC17
    UC23 -. "requires PREMIUM role" .-> UC23
```
