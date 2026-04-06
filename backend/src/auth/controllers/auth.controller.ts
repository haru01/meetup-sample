import { Router } from 'express';
import type { Request, Response } from 'express';
import { createAccountId } from '@shared/schemas/id-factories';
import { mapRegisterAccountErrorToResponse, mapLoginErrorToResponse } from './auth-error-mappings';
import type { AuthDependencies } from '../composition';
import type { Account } from '../models/account';

// ============================================================
// Auth コントローラー
// ============================================================

/**
 * アカウントレスポンス形式に変換（passwordHashを除外）
 */
function toAccountResponse(account: Account): Record<string, unknown> {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    createdAt: account.createdAt.toISOString(),
  };
}

/**
 * Auth ルーターを作成する
 *
 * @param deps Auth コンテキストの依存性
 */
export function createAuthRouter(deps: AuthDependencies): Router {
  const router = Router();

  const { registerUseCase, loginUseCase, tokenService } = deps;

  /**
   * POST /auth/register - アカウント登録
   */
  router.post('/register', async (req: Request, res: Response): Promise<void> => {
    const command = {
      id: createAccountId(),
      createdAt: new Date(),
      name: req.body.name as string,
      email: req.body.email as string,
      password: req.body.password as string,
    };

    const result = await registerUseCase(command);

    if (!result.ok) {
      const { status, response } = mapRegisterAccountErrorToResponse(result.error);
      res.status(status).json(response);
      return;
    }

    const account = result.value;
    const token = tokenService.generate({ accountId: account.id });
    res.status(201).json({ token, account: toAccountResponse(account) });
  });

  /**
   * POST /auth/login - ログイン
   */
  router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const command = {
      email: req.body.email as string,
      password: req.body.password as string,
    };

    const result = await loginUseCase(command);

    if (!result.ok) {
      const { status, response } = mapLoginErrorToResponse(result.error);
      res.status(status).json(response);
      return;
    }

    const { token, account } = result.value;
    res.status(200).json({
      token,
      account: {
        id: account.id,
        name: account.name,
        email: account.email,
        createdAt: account.createdAt.toISOString(),
      },
    });
  });

  return router;
}
