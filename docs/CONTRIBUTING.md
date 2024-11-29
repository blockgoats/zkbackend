## Contributing to ZKAuth

### Development Setup

1. **Prerequisites**
   - Node.js 18+
   - npm or yarn
   - Rust (for circuit compilation)
   - Docker (optional)

2. **Local Development**
```bash
# Clone repository
git clone https://github.com/yourusername/zkauth.git

# Install dependencies
npm install

# Setup development database
npm run migrate

# Setup test circuits
npm run setup:circuits

# Start development server
npm run dev
```

### Code Style

1. **TypeScript**
   - Use strict mode
   - Follow ESLint configuration
   - Document public APIs
   - Write unit tests

2. **Commit Messages**
   - Follow conventional commits
   - Include scope
   - Reference issues

Example:
```
feat(auth): add DID verification support (#123)
fix(zkp): resolve proof verification timeout
docs(api): update authentication flow
```

### Testing

1. **Unit Tests**
```bash
# Run all tests
npm test

# Run specific test suite
npm test auth

# Run with coverage
npm test -- --coverage
```

2. **Integration Tests**
```bash
# Run integration tests
npm run test:integration

# Run specific integration suite
npm run test:integration -- --grep "Authentication"
```

### Circuit Development

1. **Setup**
```bash
# Install circom
npm run setup:circom

# Compile circuits
npm run build:circuits

# Test circuits
npm run test:circuits
```

2. **Circuit Guidelines**
   - Document constraints
   - Optimize for gas
   - Include test vectors
   - Verify security properties

### Pull Request Process

1. Create feature branch
2. Write tests
3. Update documentation
4. Submit PR with description
5. Address review feedback
6. Maintain clean commit history

### Release Process

1. Version bump
2. Update changelog
3. Create release PR
4. Deploy to staging
5. Verify deployment
6. Tag release
7. Deploy to production

### Security

Report security issues to security@zkauth.dev

### License

MIT License - see LICENSE file