export function ProjectColumn({ projectId, ...props }) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const location: TaskLocation = {
      type: 'project',
      projectId
    };
    handleDragOver(location);
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDrop={(e) => {
        e.preventDefault();
        handleDrop({ type: 'project', projectId });
      }}
      className={cn(
        'h-full w-full',
        // Add visual feedback when dragging
        dragItem && isValidDrop({ type: 'project', projectId }) && 
        'ring-2 ring-primary ring-opacity-50'
      )}
    >
      {/* Your existing column content */}
    </div>
  );
}
