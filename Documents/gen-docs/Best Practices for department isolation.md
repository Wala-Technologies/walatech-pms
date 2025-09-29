The "best" way depends on your application's scale, tech stack, and complexity, but the following approach is a robust, secure, and scalable industry standard.

Core Concept: The "Unit of Tenancy" vs. "Unit of Data Isolation"
First, let's clarify the two levels of isolation:

Tenant Isolation: The highest level. No data from Tenant A should ever be accessible to Tenant B. This is non-negotiable.

Department Isolation (within a tenant): A user from Tenant A's "Department X" should primarily see data scoped to "Department X," unless they are a generalist.

The most common and secure pattern to achieve this is Query-Filtering at the Data Access Layer.

Recommended Approach: Query-Filtering with a Department-Aware User Context
This method involves adding a "department_id" (or similar) filter to almost every database query your application makes, based on the logged-in user's permissions.

Here’s a step-by-step breakdown:

1. Database Schema Design
Your database tables need to support both levels of isolation.

tenants Table: The root of all data.

id (UUID or Integer, PK)

departments Table: Belongs to a tenant.

id (PK)

tenant_id (FK to tenants.id)

name (e.g., "Manufacturing", "HR")

users Table: Links a user to a tenant AND a department. The department link can be nullable for generalists.

id (PK)

tenant_id (FK to tenants.id) -- Critical for initial login

department_id (FK to departments.id, NULLABLE) -- NULL indicates a generalist/generalist role.

inventory_items Table (Example): The data you want to isolate.

id (PK)

tenant_id (FK to tenants.id) -- Ensures tenant isolation

department_id (FK to departments.id) -- Enforces department isolation

name, quantity, etc.

2. Authentication & Building the User Context
When a user logs in:

Authenticate the user (e.g., validate email/password).

Load Tenant and Department Info: Perform a query to fetch the user's record, including their tenant_id and department_id.

Create a Security Context/Object: Upon successful login, create a server-side object (often called UserContext, Principal, or CurrentUser) that is attached to the user's session (or JWT token if using stateless APIs). This object must contain:

user_id

tenant_id

department_id (which could be null)

Example JWT Token Payload:

json
{
  "sub": "user_123",
  "tenant_id": "tenant_abc",
  "department_id": "dept_xyz",
  // ... other standard claims (iss, exp, etc.)
}
3. Data Access Layer: The Filtering Logic
This is the most critical part. Every function that queries inventory_items (or any department-scoped data) must automatically apply filters based on the UserContext.

Pseudocode for a generic get_inventory_items() function:

javascript
// This function is called by your API routes or services
async function getInventoryItems(filters, userContext) {

  let query = db('inventory_items')
    .where('tenant_id', userContext.tenant_id); // TENANT ISOLATION IS MANDATORY

  // DEPARTMENT ISOLATION LOGIC
  if (userContext.department_id !== null) {
    // User is department-specific: only show their department's items
    query = query.where('department_id', userContext.department_id);
  } else {
    // User is a generalist (department_id is null): show all items for the tenant
    // No extra 'where' clause is added, so they see everything.
  }

  // Apply any additional business logic filters (e.g., search by name)
  if (filters.name) {
    query = query.where('name', 'ilike', `%${filters.name}%`);
  }

  return await query;
}
Key Takeaway: The data access layer is "context-aware." It automatically decides the scope of data based on the user's role (determined by the presence/absence of a department_id).

Implementation Variations & Best Practices
1. Middleware for Context Injection (Very Effective)
In a web API, use a middleware to parse the JWT token or session and create the UserContext object. Attach this object to every request, so your service layer doesn't have to repeatedly decode tokens.

Example (Node.js/Express):

javascript
// Auth Middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  const decoded = verifyJwtToken(token);
  
  // Create the UserContext from the decoded token
  req.userContext = {
    user_id: decoded.sub,
    tenant_id: decoded.tenant_id,
    department_id: decoded.department_id
  };
  
  next(); // Pass control to the next middleware/route handler
}

// In your route handler
app.get('/api/inventory', authMiddleware, async (req, res) => {
  const items = await inventoryService.getAllItems(req.userContext);
  res.json(items);
});
2. Role-Based Access Control (RBAC) for Finer Control
For more complex scenarios (e.g., an HR generalist who should see most data but not sensitive financial data), combine this with an RBAC system.

You could have roles like department_user, hr_generalist, finance_generalist, super_admin.

Your data access logic would then check permissions (e.g., if userContext.role === 'hr_generalist') to apply even more specific filters.

3. Repository Pattern / Service Pattern
Encapsulate the filtering logic within a dedicated InventoryRepository or InventoryService class. This ensures the filtering rules are consistent and not duplicated across your application.

javascript
class InventoryService {
  constructor(userContext) {
    this.userContext = userContext;
  }

  async getItems(filters) {
    // ... filtering logic using this.userContext ...
  }
}

// Usage in a route
const inventoryService = new InventoryService(req.userContext);
const items = await inventoryService.getItems(req.query);
Summary: Why This is the "Best" Approach
Security-First: Tenant isolation is guaranteed on every query. "Fail-secure" by default.

Performance: Filtering at the database level is highly efficient. The database only returns the relevant rows.

Scalable: Easy to extend. Adding a new department-scoped entity just means adding tenant_id and department_id columns to its table and using the same filtering pattern.

Maintainable: The logic is centralized in the data access layer, making it easy to understand, test, and modify.

Flexible: The "nullable department_id" elegantly handles the generalist use case without complex rules.

This pattern is widely used in production SaaS applications and strikes an excellent balance between security, performance, and code maintainability.