import React from "react";
import NoteCard from "./NoteCard";
import { Button } from "./ui/button";
import { Grid, List, Loader2 } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
  lastModified: Date;
}

interface NotesGridProps {
  notes?: Note[];
  isListView?: boolean;
  loading?: boolean;
  onViewToggle?: () => void;
  onNoteEdit?: (id: string) => void;
  onNoteDelete?: (id: string) => void;
}

const NotesGrid = ({
  notes = [],
  loading = false,
  isListView = false,
  onViewToggle = () => {},
  onNoteEdit = () => {},
  onNoteDelete = () => {},
}: NotesGridProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-gray-500 dark:text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm mt-2">Loading notes...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-gray-500 dark:text-gray-400">
        <p className="text-xl">No notes found</p>
        <p className="text-sm mt-2">Create a new note to get started</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={onViewToggle}
            className="h-10 w-10"
          >
            {isListView ? (
              <Grid className="h-5 w-5" />
            ) : (
              <List className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div
          className={`grid gap-6 ${
            isListView
              ? "grid-cols-1"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
          }`}
        >
          {notes.map((note) => (
            <div
              key={note.id}
              className={isListView ? "w-full max-w-3xl mx-auto" : ""}
            >
              <NoteCard
                id={note.id}
                title={note.title}
                content={note.content}
                tags={note.tags}
                lastModified={note.lastModified}
                onEdit={onNoteEdit}
                onDelete={onNoteDelete}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotesGrid;
