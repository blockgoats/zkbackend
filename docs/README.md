## ZKAuth Backend Documentation

### Overview

ZKAuth is a privacy-first authentication system that uses zero-knowledge proofs to verify user identities without exposing sensitive information.

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Environment Variables

```env
PORT=4000                    # Server port
NODE_ENV=development        # Environment (development/production)
JWT_SECRET=your-secret     # JWT signing secret
JWT_EXPIRES_IN=24h         # JWT expiration time
DATABASE_URL=file:local.db # Database connection URL
```

### Dependencies

- **@libsql/client**: Database client for connecting to SQL databases.
- **circomlib**: Library for zk-SNARK circuits.
- **cors**: Middleware for enabling CORS.
- **dotenv**: Loads environment variables from a `.env` file.
- **ethers**: Library for interacting with Ethereum blockchain.
- **express**: Web framework for Node.js.
- **express-rate-limit**: Middleware for rate limiting.
- **helmet**: Security middleware for HTTP headers.
- **jsonwebtoken**: Library for creating and verifying JSON Web Tokens.
- **passport**: Authentication middleware for Node.js.
- **snarkjs**: Library for zk-SNARKs.
- **supertest**: Library for testing HTTP servers.
- **swagger-jsdoc**: Generates OpenAPI specs from JSDoc comments.
- **swagger-ui-express**: Serves Swagger UI for API documentation.
- **zod**: TypeScript-first schema validation with static type inference.

### API Endpoints

#### Authentication

##### Register User
- **POST** `/api/auth/register`
- Creates a new user account
```json
{
  "username": "string",
  "password": "string",
  "email": "string (optional)",
  "did": "string (optional)"
}
```

##### Login
- **POST** `/api/auth/login`
- Authenticates a user using password or DID proof
```json
{
  "username": "string",
  "password": "string (optional)",
  "didProof": "object (optional)"
}
```

##### Refresh Token
- **POST** `/api/auth/refresh`
- Refreshes an expired JWT token
```json
{
  "refreshToken": "string"
}
```

##### Logout
- **POST** `/api/auth/logout`
- Invalidates the current session

#### Zero-Knowledge Proofs

##### Generate Proof
- **POST** `/api/zkp/generate`
- Generates a new zero-knowledge proof
```json
{
  "challenge": "string",
  "protocol": "groth16 | plonk",
  "curve": "bn128 | bls12_381",
  "publicInputs": "array (optional)",
  "metadata": "object (optional)"
}
```

##### Verify Proof
- **POST** `/api/zkp/verify`
- Verifies a zero-knowledge proof
```json
{
  "proofId": "string",
  "protocol": "groth16 | plonk",
  "proof": "object",
  "publicSignals": "array (optional)",
  "metadata": "object (optional)"
}
```

##### Get Proof Status
- **GET** `/api/zkp/status/:proofId`
- Retrieves the status of a proof

#### Projects

##### Create Project
- **POST** `/api/projects`
- Creates a new project
```json
{
  "name": "string",
  "description": "string (optional)",
  "environment": "development | production",
  "allowedOrigins": "string"
}
```

##### List Projects
- **GET** `/api/projects`
- Retrieves all projects for the authenticated user

##### Get Project
- **GET** `/api/projects/:projectId`
- Retrieves a specific project

##### Update Project
- **PUT** `/api/projects/:projectId`
- Updates a project's details
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "environment": "development | production (optional)",
  "allowedOrigins": "string (optional)"
}
```

##### Delete Project
- **DELETE** `/api/projects/:projectId`
- Deletes a project

##### Regenerate API Key
- **POST** `/api/projects/:projectId/keys`
- Generates a new API key for the project

### Error Handling

The application uses a custom `AppError` class for consistent error handling across the codebase. This class extends the native `Error` class and includes additional properties like `statusCode`, `code`, and `metadata` for more detailed error information. Errors are logged using the `logger` utility, which provides methods for logging at different levels (info, error, warn, debug).

All errors follow this format:
```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "Human readable message",
  "metadata": {
    "additional": "error details (optional)"
  }
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid input data
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Server error

### Scripts

- **`dev`**: Starts the development server with live reloading.
- **`build`**: Compiles TypeScript to JavaScript.
- **`start`**: Runs the compiled JavaScript application.
- **`test`**: Executes tests using Mocha.
- **`migrate`**: Runs database migrations.
- **`setup:circuits`**: Sets up zk-SNARK circuits.

### Security

- All endpoints except `/auth/register` and `/auth/login` require authentication
- JWT tokens are used for session management
- Rate limiting is applied to all endpoints
- Input validation using Zod
- CORS protection
- Helmet security headers