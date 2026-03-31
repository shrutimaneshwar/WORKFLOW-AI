# Auth Testing Playbook

## Step 1: MongoDB Verification
```
mongosh
use test_database
db.users.find({role: "admin"}).pretty()
db.users.findOne({role: "admin"}, {password_hash: 1})
```
Verify: bcrypt hash starts with `$2b$`, indexes exist on users.email (unique), login_attempts.identifier, password_reset_tokens.expires_at (TTL).

## Step 2: API Testing
```
API_URL=https://workflow-insights-ai.preview.emergentagent.com

# Login
curl -c cookies.txt -X POST $API_URL/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@workflowai.com","password":"admin123"}'

# Check cookies
cat cookies.txt

# Get current user
curl -b cookies.txt $API_URL/api/auth/me

# Register new user
curl -c cookies2.txt -X POST $API_URL/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Get user with new cookies
curl -b cookies2.txt $API_URL/api/auth/me
```

## Step 3: Auth Flow Verification
- Login should return user object and set access_token + refresh_token cookies
- /me should return user data using cookies
- Logout should clear cookies
- Register should create new user and set cookies
- Invalid credentials should return 401
- Duplicate email should return 400
