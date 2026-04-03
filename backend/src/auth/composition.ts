import type { PrismaClient } from '@prisma/client';
import { PrismaAccountRepository } from './repositories/prisma-account.repository';
import { BcryptPasswordHasher } from './services/bcrypt-password-hasher';
import { JwtTokenService } from './services/jwt-token-service';
import { RegisterUseCase } from './usecases/register.usecase';
import { LoginUseCase } from './usecases/login.usecase';
import type { TokenService } from './services/token-service';

// ============================================================
// Auth コンテキスト 依存性構成
// ============================================================

export interface AuthDependencies {
  readonly registerUseCase: RegisterUseCase;
  readonly loginUseCase: LoginUseCase;
  readonly tokenService: TokenService;
}

/**
 * Auth コンテキストの依存性を構成する（Composition Root）
 */
export function createAuthDependencies(prisma: PrismaClient): AuthDependencies {
  const accountRepository = new PrismaAccountRepository(prisma);
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService();

  return {
    registerUseCase: new RegisterUseCase(accountRepository, passwordHasher),
    loginUseCase: new LoginUseCase(accountRepository, passwordHasher, tokenService),
    tokenService,
  };
}
