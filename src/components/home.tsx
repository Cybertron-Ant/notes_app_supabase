import React, { useState } from "react";
import Header from "./Header";
import NotesGrid from "./NotesGrid";
import NoteEditor from "./NoteEditor";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

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

const Home = () => {
  const [isListView, setIsListView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Welcome Note",
      content:
        "Welcome to your notes app! Start creating notes to get organized.",
      tags: [{ id: "1", name: "welcome", color: "bg-blue-100 text-blue-800" }],
      lastModified: new Date(),
    },
    {
      id: "2",
      title: "Getting Started",
      content:
        "Here are some tips to help you get started with the notes app...",
      tags: [
        { id: "2", name: "tutorial", color: "bg-green-100 text-green-800" },
      ],
      lastModified: new Date(),
    },
  ]);

  const handleViewToggle = (view: "grid" | "list") => {
    setIsListView(view === "list");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleNoteEdit = (id: string) => {
    // Implement edit functionality
    setIsEditorOpen(true);
  };

  const handleNoteSave = (note: {
    title: string;
    content: string;
    tags: Array<{ id: string; name: string; color?: string }>;
  }) => {
    // Implement save functionality
    setIsEditorOpen(false);
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        onViewToggle={handleViewToggle}
        onSearch={handleSearch}
        currentView={isListView ? "list" : "grid"}
      />

      <main className="pt-16 pb-6 px-4">
        <div className="max-w-7xl mx-auto relative">
          <NotesGrid
            notes={filteredNotes}
            isListView={isListView}
            onViewToggle={() => setIsListView(!isListView)}
            onNoteEdit={handleNoteEdit}
          />

          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
            onClick={() => setIsEditorOpen(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>

          <NoteEditor
            open={isEditorOpen}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleNoteSave}
          />
        </div>
      </main>
    </div>
  );
};

export default Home;
