## ZKAuth API Reference

### Authentication

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "alice",
  "password": "SecurePass123",
  "email": "alice@example.com"
}
```

Response:
```json
{
  "userId": "usr_abc123",
  "username": "alice",
  "token": "eyJhbGciOiJ...",
  "did": "did:zkauth:abc123"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "alice",
  "password": "SecurePass123"
}
```

Alternative DID login:
```json
{
  "username": "alice",
  "didProof": {
    "type": "Ed25519VerificationKey2020",
    "proofValue": "z3fbwh...",
    "challenge": "abc123"
  }
}
```

### Zero-Knowledge Proofs

#### Generate Proof

```http
POST /api/zkp/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "challenge": "abc123",
  "protocol": "groth16",
  "publicInputs": [1, 2, 3]
}
```

Response:
```json
{
  "id": "prf_xyz789",
  "challenge": "abc123",
  "proof": {
    "pi_a": ["0x123...", "0x456..."],
    "pi_b": [["0x789...", "0xabc..."], ["0xdef...", "0x123..."]],
    "pi_c": ["0x456...", "0x789..."]
  },
  "publicSignals": ["1", "2", "3"],
  "status": "pending"
}
```

#### Verify Proof

```http
POST /api/zkp/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "proofId": "prf_xyz789",
  "protocol": "groth16",
  "proof": {
    "pi_a": ["0x123...", "0x456..."],
    "pi_b": [["0x789...", "0xabc..."], ["0xdef...", "0x123..."]],
    "pi_c": ["0x456...", "0x789..."]
  }
}
```

Response:
```json
{
  "isValid": true,
  "verifiedAt": 1678901234567
}
```

### Projects

#### Create Project

```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My App",
  "description": "Authentication for my app",
  "environment": "development",
  "allowedOrigins": "https://myapp.com"
}
```

Response:
```json
{
  "id": "proj_abc123",
  "name": "My App",
  "description": "Authentication for my app",
  "environment": "development",
  "allowedOrigins": "https://myapp.com",
  "apiKey": "zk_test_xyz789",
  "createdAt": "2024-03-15T12:00:00Z",
  "updatedAt": "2024-03-15T12:00:00Z"
}
```

#### List Projects

```http
GET /api/projects
Authorization: Bearer <token>
```

Response:
```json
{
  "projects": [
    {
      "id": "proj_abc123",
      "name": "My App",
      "environment": "development",
      "apiKey": "zk_test_xyz789",
      "createdAt": "2024-03-15T12:00:00Z"
    }
  ]
}
```

### Error Responses

#### Validation Error
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "errors": [
    {
      "path": "username",
      "message": "Username must be at least 3 characters"
    }
  ]
}
```

#### Authentication Error
```json
{
  "status": "error",
  "code": "UNAUTHORIZED",
  "message": "Invalid credentials"
}
```

#### Rate Limit Error
```json
{
  "status": "error",
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests",
  "metadata": {
    "retryAfter": 60
  }
}
```