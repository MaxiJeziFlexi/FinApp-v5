# RBAC Security Testing - OWASP Compliance

## Test Setup

### Create Test Users with Different Tiers
```bash
# Create test users in database with different subscription tiers
curl -X POST http://localhost:5000/api/test/create-users -H "Content-Type: application/json" -d '{
  "users": [
    {"id": "test-free", "name": "Free User", "email": "free@test.com", "role": "FREE", "subscriptionTier": "FREE"},
    {"id": "test-pro", "name": "Pro User", "email": "pro@test.com", "role": "PRO", "subscriptionTier": "PRO"},
    {"id": "test-max", "name": "Max User", "email": "max@test.com", "role": "MAX_PRO", "subscriptionTier": "MAX_PRO"},
    {"id": "test-admin", "name": "Admin User", "email": "admin@test.com", "role": "ADMIN", "subscriptionTier": "ADMIN"}
  ]
}'
```

## A. Function-Level Authorization (RBAC)

### Test 1: Non-admin blocked from admin routes
```bash
# PRO user tries to access admin endpoint - should get 403
curl -i -H "Authorization: Bearer test-pro-token" http://localhost:5000/api/admin/users
# Expected: HTTP/1.1 403 Forbidden

# Admin user accesses admin endpoint - should get 200
curl -i -H "Authorization: Bearer test-admin-token" http://localhost:5000/api/admin/users  
# Expected: HTTP/1.1 200 OK
```

### Test 2: FREE user blocked from PRO features
```bash
# FREE user tries PRO feature - should get 403
curl -i -H "Authorization: Bearer test-free-token" -X POST \
  -H "Content-Type: application/json" -d '{"message": "test"}' \
  http://localhost:5000/api/chat
# Expected: HTTP/1.1 403 Insufficient permissions
```

## B. Object-Level Authorization (BOLA)

### Test 3: User cannot access another user's data
```bash
# PRO user tries to read another user's profile - should get 403
curl -i -H "Authorization: Bearer test-pro-token" \
  "http://localhost:5000/api/user/profile/test-free"
# Expected: HTTP/1.1 403 Forbidden (BOLA prevention)
```

## C. Feature Flags Reflect Role

### Test 4: Feature flags match subscription tier
```bash
# FREE user features
curl -s -H "Authorization: Bearer test-free-token" http://localhost:5000/api/me/features
# Expected: Limited features, no advanced capabilities

# MAX_PRO user features  
curl -s -H "Authorization: Bearer test-max-token" http://localhost:5000/api/me/features
# Expected: All features enabled except admin
```

## D. Quotas & Rate Limits

### Test 5: FREE transaction import quota (500/month)
```bash
# Simulate 500 imports for FREE user
for i in $(seq 1 500); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -H "Authorization: Bearer test-free-token" \
    -H "Content-Type: application/json" \
    -d '{"transactions": [{"amount": 100, "category": "test"}]}' \
    http://localhost:5000/api/transactions/import
done

# 501st request should fail with 429
curl -i -H "Authorization: Bearer test-free-token" \
  -H "Content-Type: application/json" \
  -d '{"transactions": [{"amount": 100, "category": "test"}]}' \
  http://localhost:5000/api/transactions/import
# Expected: HTTP/1.1 429 Too Many Requests
```

### Test 6: Chat message quotas by tier
```bash
# FREE: 10 messages/day limit
for i in $(seq 1 10); do
  curl -s -H "Authorization: Bearer test-free-token" \
    -H "Content-Type: application/json" \
    -d '{"message": "test '$i'"}' \
    http://localhost:5000/api/chat
done

# 11th message should fail
curl -i -H "Authorization: Bearer test-free-token" \
  -H "Content-Type: application/json" \
  -d '{"message": "test 11"}' \
  http://localhost:5000/api/chat
# Expected: HTTP/1.1 429 Too Many Requests
```

## E. Tier-Gated Features

### Test 7: Export restrictions by tier
```bash
# FREE user tries advanced export - should get 403
curl -i -H "Authorization: Bearer test-free-token" \
  "http://localhost:5000/api/export?format=xlsx&period=12m"
# Expected: HTTP/1.1 403 Insufficient permissions

# PRO user can do advanced export
curl -i -H "Authorization: Bearer test-pro-token" \
  "http://localhost:5000/api/export?format=xlsx&period=12m"  
# Expected: HTTP/1.1 200 OK
```

## F. Security Headers

### Test 8: Standard security headers present
```bash
curl -i http://localhost:5000/health | grep -Ei 'x-frame-options|content-security-policy|x-content-type-options'
# Expected: Standard Helmet security headers
```

## Negative Tests

### Test 9: JWT tampering rejected
```bash
# Tampered JWT with modified role claim - should be rejected
curl -i -H "Authorization: Bearer tampered-jwt-token" \
  http://localhost:5000/api/admin/users
# Expected: HTTP/1.1 401 Unauthorized
```

### Test 10: CORS bypass still enforces RBAC
```bash
# Direct API call bypassing browser CORS - should still check auth
curl -i -H "Origin: https://malicious.com" \
  -H "Authorization: Bearer test-free-token" \
  http://localhost:5000/api/admin/users
# Expected: HTTP/1.1 403 Insufficient permissions
```

### Test 11: IDOR/Path fuzzing
```bash
# Try to access resources with different user IDs
curl -i -H "Authorization: Bearer test-free-token" \
  "http://localhost:5000/api/user/profile/admin-user"
# Expected: HTTP/1.1 403 Forbidden

curl -i -H "Authorization: Bearer test-free-token" \
  "http://localhost:5000/api/user/profile/../admin/users"
# Expected: HTTP/1.1 403 Forbidden or 404
```

## Expected Results Matrix

| Endpoint | FREE | PRO | MAX_PRO | ADMIN |
|----------|------|-----|---------|--------|
| `/api/user/profile` | 200 | 200 | 200 | 200 |
| `/api/financial/viz3d` | 200 | 200 | 200 | 200 |
| `/api/transactions/import` (under quota) | 200 | 200 | 200 | 200 |
| `/api/transactions/import` (over quota) | 429 | 200 | 200 | 200 |
| `/api/chat` (under quota) | 200 | 200 | 200 | 200 |
| `/api/chat` (over quota) | 429 | 429 | 200 | 200 |
| `/api/analytics/advanced` | 403 | 200 | 200 | 200 |
| `/api/export` (basic) | 200 | 200 | 200 | 200 |
| `/api/export` (advanced) | 403 | 200 | 200 | 200 |
| `/api/admin/*` | 403 | 403 | 403 | 200 |

## Monitoring & Alerts

- Log all 403/429 responses for security analysis
- Alert on any unexpected 200 responses where 403/429 was expected
- Monitor quota usage patterns for abuse detection
- Track failed authentication attempts