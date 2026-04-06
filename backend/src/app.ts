import express from 'express';
import type { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import type { PrismaClient } from '@prisma/client';
import { generateOpenAPIDocument } from '@shared/openapi/registry';
import { createOpenApiValidatorMiddleware } from '@shared/middleware/openapi-validator.middleware';
import { errorHandlerMiddleware } from '@shared/middleware/error-handler.middleware';
import { prisma as defaultPrisma } from './infrastructure/prisma';
import { createAuthRouter } from './auth/controllers/auth.controller';
import { createCommunityRouter } from './community/controllers/community.controller';
import { createMemberRouter } from './community/controllers/member.controller';
import { createEventRouter } from './community/controllers/event.controller';
import { createAuthDependencies } from './auth/composition';
import { createCommunityDependencies } from './community/composition';
// OpenAPI定義を登録（side-effect import）
import './auth/controllers/auth-openapi';
import './community/controllers/community-openapi';
import './community/controllers/member-openapi';
import './community/controllers/event-openapi';

// ============================================================
// Express Application Factory
// ============================================================

/**
 * Expressアプリケーションを作成する
 *
 * @param prismaClient Prisma クライアント（テスト時はテスト用インスタンスを渡す）
 */
export function createApp(prismaClient: PrismaClient = defaultPrisma): Application {
  const application = express();

  // JSON body parser
  application.use(express.json());

  // OpenAPI document
  const openApiDocument = generateOpenAPIDocument();

  // Swagger UI
  application.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  // Expose raw OpenAPI spec
  application.get('/openapi.json', (_req, res) => res.json(openApiDocument));

  // OpenAPI request validation
  application.use(createOpenApiValidatorMiddleware(openApiDocument));

  // Health check
  application.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Composition Root: 依存性の構成
  const authDeps = createAuthDependencies(prismaClient);
  const communityDeps = createCommunityDependencies(prismaClient);

  // Auth routes
  application.use('/auth', createAuthRouter(authDeps));

  // Community routes
  application.use('/communities', createCommunityRouter(communityDeps.community));

  // Member routes (nested under communities)
  application.use('/communities/:id/members', createMemberRouter(communityDeps.member));

  // Event routes (nested under communities)
  application.use('/communities/:id/events', createEventRouter(communityDeps.event));

  // Error handler (MUST be last)
  application.use(errorHandlerMiddleware);

  return application;
}

// ============================================================
// Default application instance (production)
// ============================================================
export const app = createApp();
