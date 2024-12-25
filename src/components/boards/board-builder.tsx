import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useBoardStore } from '../../lib/store/board-store';
import { Button } from '../ui/button';
import { TaskCard } from './task-card';
import { Timeline } from './timeline';
import { LayoutGrid, Calendar } from 'lucide-react';

interface BoardBuilderProps {
  boardId: string;
}

export function BoardBuilder({ boardId }: BoardBuilderProps) {
  const [showTimeline, setShowTimeline] = useState(false);
  const { boards, updateBoard } = useBoardStore();
  const board = boards.find(b => b.id === boardId);

  if (!board) return null;

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const tasks = [...board.tasks];
    const [removed] = tasks.splice(source.index, 1);
    tasks.splice(destination.index, 0, removed);

    updateBoard(boardId, {
      ...board,
      tasks,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTimeline(!showTimeline)}
          className="gap-2"
        >
          {showTimeline ? (
            <>
              <LayoutGrid className="h-4 w-4" />
              Board View
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4" />
              Timeline View
            </>
          )}
        </Button>
      </div>
      {showTimeline ? (
        <Timeline tasks={board.tasks} onTaskMove={handleDragEnd} onDropFromSource={() => {}} />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {board.tasks.map((task, index) => (
                  <Draggable
                    key={task.id}
                    draggableId={task.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskCard task={task} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
