import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth } from '@shared/middleware/auth.middleware';
import { createEventId } from '@shared/schemas/id-factories';
import type { AccountId, CommunityId } from '@shared/schemas/common';
import { mapCreateEventErrorToResponse } from './event-error-mappings';
import type { Event } from '../models/event';
import type { EventFormat } from '../models/schemas/event.schema';
import type { EventDependencies } from '../composition';

// ============================================================
// イベントレスポンス変換
// ============================================================

function toEventResponse(event: Event): Record<string, unknown> {
  return {
    id: event.id,
    communityId: event.communityId,
    title: event.title,
    description: event.description,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt.toISOString(),
    format: event.format,
    capacity: event.capacity,
    status: event.status,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}

// ============================================================
// イベントルーターファクトリ
// ============================================================

/**
 * イベントルーターを作成する
 *
 * @param deps イベントコンテキストの依存性
 */
export function createEventRouter(deps: EventDependencies): Router {
  const router = Router({ mergeParams: true });

  const { createEventCommand, requireCommunityRole } = deps;

  /**
   * POST /communities/:id/events — イベント作成
   */
  router.post(
    '/',
    requireAuth,
    requireCommunityRole,
    async (req: Request, res: Response): Promise<void> => {
      const now = new Date();

      const command = {
        id: createEventId(),
        communityId: req.params['id'] as CommunityId,
        createdBy: req.accountId as AccountId,
        title: req.body.title as string,
        description: (req.body.description as string | null | undefined) ?? null,
        startsAt: new Date(req.body.startsAt as string),
        endsAt: new Date(req.body.endsAt as string),
        format: req.body.format as EventFormat,
        capacity: req.body.capacity as number,
        now,
        createdAt: now,
        updatedAt: now,
      };

      const result = await createEventCommand(command);

      if (!result.ok) {
        const { status, response } = mapCreateEventErrorToResponse(result.error);
        res.status(status).json(response);
        return;
      }

      res.status(201).json({ event: toEventResponse(result.value) });
    }
  );

  return router;
}
