import { useState, useCallback } from "react";
import { apiClient } from "../../lib/api-client";
import type { Event, EventResponse, CreateEventRequest } from "../types";

export const useEvents = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = useCallback(
    async (
      communityId: string,
      data: CreateEventRequest,
    ): Promise<Event | null> => {
      setLoading(true);
      setError(null);
      const result = await apiClient.post<EventResponse>(
        `/communities/${communityId}/events`,
        data,
      );
      if (result.ok) {
        setLoading(false);
        return result.data.event;
      }
      setError("イベントの作成に失敗しました");
      setLoading(false);
      return null;
    },
    [],
  );

  return { createEvent, loading, error };
};
