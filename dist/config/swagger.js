import swaggerJsdoc from 'swagger-jsdoc';
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ZKAuth API Documentation',
            version: '1.0.0',
            description: 'API documentation for ZKAuth - Privacy-First Authentication',
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
            contact: {
                name: 'API Support',
                url: 'https://zkauth.dev/support',
                email: 'support@zkauth.dev',
            },
        },
        servers: [
            {
                url: 'http://localhost:4000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'error'
                        },
                        message: {
                            type: 'string',
                            example: 'Invalid credentials'
                        },
                        code: {
                            type: 'string',
                            example: 'UNAUTHORIZED'
                        }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        userId: {
                            type: 'string',
                            example: 'usr_1234567890'
                        },
                        username: {
                            type: 'string',
                            example: 'johndoe'
                        },
                        token: {
                            type: 'string',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                        }
                    }
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Access token is missing or invalid',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication endpoints'
            },
            {
                name: 'Zero-Knowledge Proofs',
                description: 'ZKP generation and verification endpoints'
            },
            {
                name: 'Projects',
                description: 'Project management endpoints'
            }
        ]
    },
    apis: ['./src/routes/*.ts'],
};
export const specs = swaggerJsdoc(options);
