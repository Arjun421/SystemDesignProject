# 📚 Digital Library & Course Management — Evaluation Notes

> Mid-term evaluation ke liye — OOP, Design Patterns, SOLID, SDLC, UML sab cover hai

---

## 🏗️ Project Overview

Ek full-stack Digital Library platform jahan users:
- Books borrow/return kar sakte hain
- Courses mein enroll ho sakte hain
- Learning Paths follow kar sakte hain
- Personalized recommendations milti hain

Role-based access hai: **FREE → PREMIUM → ADMIN**

**Tech Stack:** Node.js + TypeScript + Express + Prisma + PostgreSQL (backend), React + Tailwind (frontend)

---

## 1. 🧱 OOP CONCEPTS

### 1.1 Inheritance

**Kahan hai:** `backend/prisma/schema.prisma` + `backend/src/patterns/`

Database mein `Resource` ek base table hai. `Book` aur `Course` dono usse extend karte hain (same `id` share karte hain, Cascade delete).

```
Resource (base)
├── Book   → author, isbn, availableCopies, totalCopies
└── Course → instructor, durationHours, modules
```

Code mein `BaseWorkflow` abstract class hai jo `BorrowWorkflow`, `ReturnWorkflow`, `EnrollWorkflow` extend karte hain:

```
BaseWorkflow<TInput, TOutput>  (abstract)
├── BorrowWorkflow
├── ReturnWorkflow
└── EnrollWorkflow
```

**File:** `backend/src/patterns/base-workflow.template.ts`

---

### 1.2 Abstraction

`BaseWorkflow` mein `validate()` aur `execute()` abstract methods hain — subclass ko implement karna padta hai, caller ko andar ki details nahi pata.

```typescript
// base-workflow.template.ts
abstract class BaseWorkflow<TInput, TOutput> {
  async run(input: TInput): Promise<TOutput> {  // fixed skeleton
    await this.validate(input)   // abstract
    const result = await this.execute(input)  // abstract
    await this.postProcess(input, result)  // optional hook
    return result
  }
}
```

`AppError` class bhi abstraction ka example hai — caller sirf `notFound()`, `forbidden()` call karta hai, andar ka HTTP status code hide hai.

**File:** `backend/src/errors/app-error.ts`

---

### 1.3 Encapsulation

`ResourceAccessProxy` class mein `checkPremiumAccess()` aur `getUserRole()` private methods hain — bahar se directly call nahi ho sakti. Proxy sirf `getById()` aur `getAll()` expose karta hai.

```typescript
// resource-access.proxy.ts
class ResourceAccessProxy {
  private real = new RealResourceService()  // private
  private async checkPremiumAccess(userId?) { ... }  // private
  private async getUserRole(userId?) { ... }  // private

  public async getById(id, userId?) { ... }  // public
  public async getAll(params, userId?) { ... }  // public
}
```

**File:** `backend/src/patterns/resource-access.proxy.ts`

---

### 1.4 Polymorphism

`BaseWorkflow` ka `run()` method same hai — lekin `BorrowWorkflow.validate()` alag kaam karta hai (book availability + borrow limit check) aur `EnrollWorkflow.validate()` alag (duplicate enrollment check). Same interface, alag behavior.

---

## 2. 🎨 DESIGN PATTERNS

### 2.1 Template Method Pattern ⭐

**Kahan:** `backend/src/patterns/base-workflow.template.ts`

**Kya hai:** Ek fixed algorithm skeleton define karo, specific steps subclass fill kare.

```
run() → validate() → execute() → postProcess()
  ↑ fixed order      ↑ subclass implement kare
```

**Kyun use kiya:** Borrow aur Enroll dono ka flow same hai (validate → execute → log), sirf andar ki logic alag hai. Code duplication zero.

**Files:**
- `backend/src/patterns/base-workflow.template.ts` — abstract base
- `backend/src/patterns/borrow-workflow.template.ts` — BorrowWorkflow + ReturnWorkflow
- `backend/src/patterns/enroll-workflow.template.ts` — EnrollWorkflow

---

### 2.2 Proxy Pattern ⭐

**Kahan:** `backend/src/patterns/resource-access.proxy.ts`

**Kya hai:** Real service ke aage ek proxy baithao jo access control kare.

```
Controller → ResourceAccessProxy → RealResourceService → DB
                ↓
         (premium check yahan hota hai)
```

**Kyun use kiya:** Resource fetch karne se pehle check karo — kya user premium content access kar sakta hai? Ye logic real service mein nahi daala, proxy mein rakha — separation of concerns.

```typescript
// Proxy getById mein pehle resource fetch karta hai, phir check karta hai
async getById(id: string, userId?: string) {
  const resource = await this.real.getById(id)  // real service call
  if (resource.isPremium) {
    await this.checkPremiumAccess(userId)  // access control
  }
  return resource
}
```

---

### 2.3 Repository Pattern

**Kahan:** `backend/src/repositories/`

**Kya hai:** Database queries ek jagah isolate karo. Service ko pata nahi Prisma use ho raha hai ya kuch aur.

**Files:**
- `book.repository.ts` — borrow, return, history, overdue marking
- `course.repository.ts` — enroll, progress update, module tracking
- `learning-path.repository.ts` — path management
- `resource.repository.ts` — search, filter, recommendations
- `user.repository.ts` — find by email/username/id

---

### 2.4 Singleton Pattern (implicit)

**Kahan:** `backend/src/config/prisma.ts`

Prisma client ek hi instance export hota hai — poore app mein same connection pool use hoti hai.

---

## 3. 🔷 SOLID PRINCIPLES

### S — Single Responsibility Principle

Har class/file ka ek kaam:

| File | Responsibility |
|------|---------------|
| `auth.service.ts` | Sirf register/login/token logic |
| `book.repository.ts` | Sirf DB queries for books |
| `auth.middleware.ts` | Sirf JWT verify karna |
| `validate.middleware.ts` | Sirf Zod schema validation |
| `async-handler.ts` | Sirf async errors catch karna |
| `app-error.ts` | Sirf error types define karna |

---

### O — Open/Closed Principle

`BaseWorkflow` open for extension, closed for modification.

Naya workflow add karna ho (e.g., `RenewWorkflow`) toh `BaseWorkflow` ko touch nahi karna — sirf extend karo:

```typescript
class RenewWorkflow extends BaseWorkflow<RenewInput, unknown> {
  protected async validate(...) { /* naya logic */ }
  protected async execute(...) { /* naya logic */ }
}
```

---

### L — Liskov Substitution Principle

`BorrowWorkflow`, `ReturnWorkflow`, `EnrollWorkflow` — teeno `BaseWorkflow` ki jagah use ho sakte hain bina kuch toote. `run()` method ka behavior consistent hai.

---

### I — Interface Segregation Principle

`IResourceAccess` interface sirf do methods expose karta hai — `getById` aur `getAll`. Controller ko baki implementation details nahi chahiye.

```typescript
// resource-access.proxy.ts
export interface IResourceAccess {
  getById(id: string, userId?: string): Promise<unknown>
  getAll(params: {...}, userId?: string): Promise<unknown>
}
```

---

### D — Dependency Inversion Principle

Controllers services pe depend karte hain, services repositories pe — direct DB calls controllers mein nahi hote. High-level modules low-level implementation se decoupled hain.

```
Controller → Service → Repository → Prisma (DB)
```

---

## 4. 📋 SDLC & SYSTEM DESIGN

### Architecture — Layered (Clean Architecture)

```
HTTP Request
    ↓
Routes          (backend/src/routes/)
    ↓
Middleware      (auth, validate, error handling)
    ↓
Controllers     (backend/src/controllers/)
    ↓
Services        (backend/src/services/)
    ↓
Repositories    (backend/src/repositories/)
    ↓
Prisma ORM
    ↓
PostgreSQL (Neon)
```

### Key System Flows

**Auth Flow (JWT):**
```
Register/Login → bcrypt hash → JWT sign (7d expiry) → token return
Next requests → Bearer token → auth.middleware.ts verify → userId inject
```

**Google OAuth Flow:**
```
/auth/google → passport.js → Google → callback → find/create user → JWT return
```

**Borrow Book Flow:**
```
POST /books/:id/borrow
→ JWT verify
→ markOverdueBorrows() (auto-update stale records)
→ BorrowWorkflow.validate() → premium check
→ BorrowWorkflow.execute() → DB transaction:
   - active borrow count < 3?
   - already borrowed?
   - availableCopies > 0? → decrement
   - create borrow_record (dueDate = +14 days)
```

**Course Enrollment Flow:**
```
POST /courses/:id/enroll
→ JWT verify
→ EnrollWorkflow.validate() → premium check
→ EnrollWorkflow.execute() → DB transaction:
   - duplicate enrollment check
   - create enrollment
   - create CourseModuleProgress rows for each module
   - recalculate progress (0%)
```

**Recommendation Engine:**
```
GET /recommendations
→ fetch user's active learning paths + borrowed books + enrolled courses
→ extract preferred categories + tags
→ score candidate resources:
   - +6 if in active learning path
   - +3 if category matches
   - +2 per matching tag
→ return top 8 resources + top 6 learning paths
```

---

## 5. 📊 UML — Key Diagrams (README mein hain)

README.md mein ye diagrams hain:

1. **Architecture Diagram** — layered flow (Client → API → Auth → Controllers → Services → Repositories → DB)
2. **Class Diagram** — User, Resource, Book, Course, BorrowRecord, Enrollment, LearningPath, BaseWorkflow hierarchy, ResourceAccessProxy
3. **Sequence Diagrams** — Borrow Book flow, Course Enrollment flow
4. **Use Case Diagram** — Guest / Free / Premium / Admin actors aur unke use cases

---

## 6. 🗂️ File Map — Evaluation ke liye important files

| Concept | File |
|---------|------|
| Template Method Pattern | `backend/src/patterns/base-workflow.template.ts` |
| Borrow Workflow | `backend/src/patterns/borrow-workflow.template.ts` |
| Enroll Workflow | `backend/src/patterns/enroll-workflow.template.ts` |
| Proxy Pattern | `backend/src/patterns/resource-access.proxy.ts` |
| Repository Pattern | `backend/src/repositories/*.ts` |
| SRP — Error handling | `backend/src/errors/app-error.ts` |
| SRP — Async wrapper | `backend/src/utils/async-handler.ts` |
| Auth (JWT + bcrypt) | `backend/src/services/auth.service.ts` |
| Google OAuth | `backend/src/config/passport.ts` |
| JWT Middleware | `backend/src/middleware/auth.middleware.ts` |
| DB Schema (OOP hierarchy) | `backend/prisma/schema.prisma` |
| Recommendation Engine | `backend/src/services/recommendation.service.ts` |
| DB Transactions | `backend/src/repositories/book.repository.ts` |

---

## 7. 💡 Demo ke liye talking points

1. **"Humne Template Method use kiya"** → `base-workflow.template.ts` dikhao — `run()` fixed hai, `validate()` aur `execute()` subclass mein
2. **"Proxy Pattern se access control"** → `resource-access.proxy.ts` dikhao — premium check transparently hota hai
3. **"Repository Pattern se DB decoupled hai"** → `book.repository.ts` dikhao — service ko Prisma ka pata nahi
4. **"SOLID follow kiya"** → `app-error.ts` (SRP), `BaseWorkflow` (OCP), `IResourceAccess` (ISP)
5. **"DB transactions use kiye"** → `book.repository.ts` mein `borrow()` — Serializable isolation level, race condition safe
6. **"Recommendation engine"** → scoring algorithm dikhao — category + tag matching with weights
