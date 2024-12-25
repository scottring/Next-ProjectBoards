import { create } from 'zustand';
import { Board } from '@/types';

interface BoardStore {
  boards: Board[];
  fetchBoards: () => Promise<void>;
  createBoard: (board: Partial<Board>) => Promise<Board>;
  updateBoard: (id: string, board: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
}

export const useBoardStore = create<BoardStore>((set) => ({
  boards: [],

  fetchBoards: async () => {
    // Mock API call
    const boards: Board[] = [
      {
        id: '1',
        name: 'Project Alpha',
        description: 'Main project board',
        tasks: [],
        settings: {
          layout: {
            showSidebar: true,
            showTimeline: true,
          },
        },
      },
    ];
    set({ boards });
  },

  createBoard: async (board) => {
    const newBoard: Board = {
      id: Math.random().toString(36).substring(7),
      name: board.name || 'Untitled Board',
      description: board.description || '',
      tasks: board.tasks || [],
      settings: board.settings || {
        layout: {
          showSidebar: true,
          showTimeline: false,
        },
      },
    };

    set((state) => ({
      boards: [...state.boards, newBoard],
    }));

    return newBoard;
  },

  updateBoard: (id, board) => {
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === id ? { ...b, ...board } : b
      ),
    }));
  },

  deleteBoard: (id) => {
    set((state) => ({
      boards: state.boards.filter((b) => b.id !== id),
    }));
  },
})); 