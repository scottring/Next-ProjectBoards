'use client';

import { useEffect } from 'react';
import { useBoardStore } from '@/lib/store/board-store';
import { useAuth } from '@/contexts/auth-context';
import { BoardCreateDialog } from '@/components/boards/board-create-dialog';

export default function BoardsPage() {
  const { boards, fetchBoards } = useBoardStore();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBoards(user.uid);
    }
  }, [fetchBoards, user]);

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Boards</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage your project boards.
          </p>
        </div>
        <BoardCreateDialog />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.map((board) => (
          <div
            key={board.id}
            className="group relative overflow-hidden rounded-lg border bg-background p-5 transition-all hover:border-primary"
          >
            <div className="flex flex-col space-y-2">
              <h2 className="text-xl font-semibold">{board.name}</h2>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {board.description}
              </p>
            </div>
            <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
              <a
                href={`/boards/${board.id}`}
                className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Open Board
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 