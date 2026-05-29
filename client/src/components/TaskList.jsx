import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import TaskItem from './TaskItem.jsx';

export function moveTask(ids, draggedId, insertIndex) {
  const fromIndex = ids.indexOf(draggedId);

  if (fromIndex === -1 || insertIndex < 0 || insertIndex > ids.length) {
    return ids;
  }

  let toIndex = insertIndex;
  if (fromIndex < toIndex) {
    toIndex -= 1;
  }

  if (fromIndex === toIndex) {
    return ids;
  }

  const next = [...ids];
  const [movedId] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, movedId);
  return next;
}

export function getInsertIndexFromPointer(clientY, itemElements) {
  if (itemElements.length === 0) {
    return 0;
  }

  const firstRect = itemElements[0].getBoundingClientRect();
  if (clientY <= firstRect.top) {
    return 0;
  }

  const lastRect = itemElements[itemElements.length - 1].getBoundingClientRect();
  if (clientY >= lastRect.bottom) {
    return itemElements.length;
  }

  for (let index = 0; index < itemElements.length; index += 1) {
    const rect = itemElements[index].getBoundingClientRect();
    if (clientY < rect.bottom) {
      return index + 1;
    }
  }

  return itemElements.length;
}

function InsertionLine() {
  return <li className="task-list__insertion-line" aria-hidden="true" />;
}

export function useTaskListReorder({ canReorder, tasks, onReorder }) {
  const [draggedId, setDraggedId] = useState(null);
  const [insertIndex, setInsertIndex] = useState(null);
  const listRef = useRef(null);
  const tasksRef = useRef(tasks);
  const dragStateRef = useRef({ draggedId: null, insertIndex: null });

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    dragStateRef.current = { draggedId, insertIndex };
  }, [draggedId, insertIndex]);

  const finishDrag = () => {
    setDraggedId(null);
    setInsertIndex(null);
  };

  const handleDrop = useCallback(() => {
    const { draggedId: activeId, insertIndex: activeIndex } = dragStateRef.current;

    if (!canReorder || !activeId || activeIndex === null) {
      setDraggedId(null);
      setInsertIndex(null);
      return;
    }

    const nextOrder = moveTask(
      tasksRef.current.map((task) => task.id),
      activeId,
      activeIndex,
    );

    onReorder(nextOrder);
    setDraggedId(null);
    setInsertIndex(null);
  }, [canReorder, onReorder]);

  useEffect(() => {
    if (!draggedId || !canReorder) {
      return undefined;
    }

    const updateInsertIndex = (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';

      const items = listRef.current?.querySelectorAll('.task-item');
      if (!items?.length) {
        return;
      }

      setInsertIndex(getInsertIndexFromPointer(event.clientY, items));
    };

    const handleDocumentDrop = (event) => {
      event.preventDefault();
      handleDrop();
    };

    document.addEventListener('dragover', updateInsertIndex);
    document.addEventListener('drop', handleDocumentDrop);

    return () => {
      document.removeEventListener('dragover', updateInsertIndex);
      document.removeEventListener('drop', handleDocumentDrop);
    };
  }, [draggedId, canReorder, handleDrop]);

  const startDrag = (taskId, index) => {
    setDraggedId(taskId);
    setInsertIndex(index);
  };

  return {
    draggedId,
    insertIndex,
    listRef,
    finishDrag,
    handleDrop,
    startDrag,
  };
}

export default function TaskList({
  tasks,
  loading = false,
  emptyMessage = 'No tasks yet. Add one above.',
  canReorder = false,
  onToggleComplete,
  onDelete,
  onEdit,
  onReorder,
}) {
  const {
    draggedId,
    insertIndex,
    listRef,
    finishDrag,
    startDrag,
  } = useTaskListReorder({ canReorder, tasks, onReorder });

  if (loading) {
    return <p className="task-list__status">Loading tasks…</p>;
  }

  if (tasks.length === 0) {
    return <p className="task-list__empty">{emptyMessage}</p>;
  }

  const showInsertionLine = (index) =>
    draggedId !== null && insertIndex === index;

  return (
    <>
      {canReorder && tasks.length > 1 && (
        <p className="task-list__hint">Drag tasks to reorder</p>
      )}
      <ul
        ref={listRef}
        className={`task-list${draggedId ? ' task-list--dragging' : ''}`}
      >
        {tasks.map((task, index) => (
          <Fragment key={task.id}>
            {showInsertionLine(index) && <InsertionLine />}
            <TaskItem
              task={task}
              canReorder={canReorder}
              isDragging={draggedId === task.id}
              onDragStart={() => startDrag(task.id, index)}
              onDragEnd={finishDrag}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          </Fragment>
        ))}
        {showInsertionLine(tasks.length) && <InsertionLine />}
      </ul>
    </>
  );
}
