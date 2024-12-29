import { create } from 'zustand';
import { Board } from '@/types';
import { getBoards, addBoard, updateBoard as updateFirestoreBoard, deleteBoard as deleteFirestoreBoard } from '@/lib/firestore';

interface BoardStore {
  boards: Board[];
  fetchBoards: (userId: string) => Promise<void>;
  createBoard: (userId: string, board: Partial<Board>) => Promise<Board>;
  updateBoard: (id: string, board: Partial<Board>) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
}

export const useBoardStore = create<BoardStore>((set) => ({
  boards: [],

  fetchBoards: async (userId: string) => {
    try {
      const boards = await getBoards(userId);
      set({ boards });
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    }
  },

  createBoard: async (userId: string, board) => {
    try {
      const newBoard = await addBoard(userId, {
        name: board.name || 'Untitled Board',
        description: board.description || '',
        tasks: board.tasks || [],
        userId: userId,
        settings: board.settings || {
          layout: {
            showSidebar: true,
            showTimeline: false,
          },
        },
      });

      set((state) => ({
        boards: [...state.boards, newBoard],
      }));

      return newBoard;
    } catch (error) {
      console.error('Failed to create board:', error);
      throw error;
    }
  },

  updateBoard: async (id, board) => {
    try {
      await updateFirestoreBoard(id, board);
      set((state) => ({
        boards: state.boards.map((b) =>
          b.id === id ? { ...b, ...board } : b
        ),
      }));
    } catch (error) {
      console.error('Failed to update board:', error);
      throw error;
    }
  },

  deleteBoard: async (id) => {
    try {
      await deleteFirestoreBoard(id);
      set((state) => ({
        boards: state.boards.filter((b) => b.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete board:', error);
      throw error;
    }
  },
})); 