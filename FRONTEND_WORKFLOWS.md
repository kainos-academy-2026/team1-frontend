# Frontend Application Workflows

This diagram shows the main user workflows in the team1-frontend application. Use this as a reference when selecting workflows to test with the Playwright testing framework.

```mermaid
graph TD
    A["👤 User Visits App<br/>(GET /)"] --> B{Authenticated?}
    B -->|No| C["🔓 Unauthenticated Flow"]
    B -->|Yes| D["🔐 Authenticated Flow"]
    
    C --> C1["Login Workflow"]
    C1 --> C1A["GET /auth/login<br/>(Render Login Form)"]
    C1A --> C1B["POST /auth/login<br/>(Validate Credentials)"]
    C1B --> C1B1{Login Successful?}
    C1B1 -->|Yes| C1C["✅ Set Auth Cookie<br/>Redirect to Job Roles"]
    C1B1 -->|No| C1D["❌ Show Error<br/>Redirect to Login"]
    
    C --> C2["Registration Workflow"]
    C2 --> C2A["GET /registration<br/>(Render Registration Form)"]
    C2A --> C2B["POST /registration<br/>(Validate Input)"]
    C2B --> C2B1{Registration Valid?}
    C2B1 -->|Yes| C2C["✅ Create User<br/>Redirect to Login"]
    C2B1 -->|No| C2D["❌ Show Field Errors<br/>Redirect to Registration"]
    
    D --> D1["Job Browsing Workflow"]
    D1 --> D1A["GET /job-roles<br/>(List All Jobs)"]
    D1A --> D1B["Filter/Paginate<br/>Display Results"]
    D1B --> D1C["Click Job Card"]
    D1C --> D1D["GET /job-roles/:id<br/>(View Details)"]
    
    D --> D2["Application Workflow"]
    D2 --> D2A{User Role = User?}
    D2A -->|No| D2A1["❌ Admin Cannot Apply<br/>Show Error"]
    D2A -->|Yes| D2B["GET /job-roles/:id/apply<br/>(Render Apply Form)"]
    D2B --> D2C["POST /job-roles/:id/apply<br/>(Submit Application)"]
    D2C --> D2C1{Application Valid?}
    D2C1 -->|Yes| D2D["✅ Application Saved<br/>Show Success"]
    D2C1 -->|No| D2E["❌ Show Validation Errors<br/>Redirect to Apply"]
    
    D --> D3["Logout Workflow"]
    D3 --> D3A["POST /auth/logout<br/>(Clear Session)"]
    D3A --> D3B["✅ Redirect to Home<br/>Unauthenticated"]
    
    C1C --> D1A
    D1D --> D2A
    D3B --> A
    
    style A fill:#e1f5ff
    style C fill:#fff3e0
    style D fill:#f3e5f5
    style C1C fill:#c8e6c9
    style C2C fill:#c8e6c9
    style D2D fill:#c8e6c9
    style D3B fill:#c8e6c9
    style C1D fill:#ffcdd2
    style C2D fill:#ffcdd2
    style D2A1 fill:#ffcdd2
    style D2E fill:#ffcdd2
```

## Key Workflows for Playwright Testing

### 1. **Authentication Flows**
- **Login**: Render form → Submit credentials → Validate → Redirect (success/error)
- **Registration**: Render form → Submit data → Validate → Create user → Redirect (success/error)
- **Logout**: Clear session → Redirect to home

### 2. **Job Browsing Flows**
- **List Jobs**: View all available job roles with pagination/filtering
- **View Details**: Click on a job to see full details (title, description, salary, etc.)

### 3. **Application Flow**
- **Apply for Job**: 
  - User (role check) → Render apply form
  - Submit application with validation
  - Success/error handling and redirect

### 4. **Authorization Checks**
- **Admin vs User**: Different access levels (Admins can't apply, Users can't access admin features)
- **Authenticated vs Unauthenticated**: Different routes available

## Middleware & Validation Points
- `validateBody()` - Validates request payloads against schemas
- `authoriseRoles()` - Checks user role for route access
- `validateJobRoleId` - Validates job role ID parameter
- `setErrorRedirect()` - Handles error redirects with context
- `userInfo` - Loads user info from auth cookies

## Test Coverage Recommendations

| Workflow | Test Type | Priority |
|----------|-----------|----------|
| Login (success) | E2E | High |
| Login (invalid credentials) | E2E | High |
| Registration (success) | E2E | High |
| Registration (validation errors) | E2E | High |
| Logout | E2E | Medium |
| View job list | E2E | High |
| View job details | E2E | High |
| Apply for job (success) | E2E | High |
| Apply for job (validation errors) | E2E | Medium |
| Authorization: Admin cannot apply | E2E | Medium |
| Authorization: Unauthenticated cannot access jobs | E2E | Medium |
