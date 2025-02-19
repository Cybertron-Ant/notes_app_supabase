import { useState, useEffect } from "react";
import { useAuth } from "./auth/AuthProvider";
import Header from "./Header";
import NotesGrid from "./NotesGrid";
import NoteEditor from "./NoteEditor";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { usePayment } from "../features/payment/presentation/PaymentProvider";
import UpgradeDialog from "../features/payment/presentation/UpgradeDialog";
import { api } from "../lib/api";

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
  const { user } = useAuth();
  const { limits, loading: paymentLoading } = usePayment();
  const [isListView, setIsListView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [availableTags, setAvailableTags] = useState([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    if (user) {
      loadNotes();
      loadTags();
    }
  }, [user]);

  const loadNotes = async () => {
    try {
      const notes = await api.notes.list();
      setNotes(
        notes.map((note) => ({
          ...note,
          lastModified: new Date(note.updated_at),
        })),
      );
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const tags = await api.tags.list();
      setAvailableTags(tags);
    } catch (error) {
      console.error("Error loading tags:", error);
    }
  };

  const handleViewToggle = () => {
    setIsListView(!isListView);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleNoteEdit = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setEditingNote(note);
      setIsEditorOpen(true);
    }
  };

  const handleNoteDelete = async (noteId: string) => {
    try {
      await api.notes.delete(noteId);
      setNotes(notes.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleNoteSave = async (note: {
    title: string;
    content: string;
    tags: { id: string; name: string }[];
  }) => {
    try {
      if (editingNote) {
        await api.notes.update(editingNote.id, {
          title: note.title,
          content: note.content,
          tags: note.tags.map((t) => t.id),
        });
      } else {
        await api.notes.create({
          title: note.title,
          content: note.content,
          tags: note.tags.map((t) => t.id),
        });
      }
      loadNotes();
      setIsEditorOpen(false);
      setEditingNote(null);
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleCreateNote = () => {
    if (!limits?.canCreateNote) {
      setShowUpgradeDialog(true);
      return;
    }
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag =
        !selectedTag || note.tags.some((t) => t.id === selectedTag);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="pt-16 pb-6 px-2 sm:px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center h-[calc(100vh-8rem)]">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">
                Welcome to Notes App
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please sign in with GitHub to create and manage your notes
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        onViewToggle={handleViewToggle}
        onSearch={handleSearch}
        currentView={isListView ? "list" : "grid"}
        onTagFilter={setSelectedTag}
        selectedTag={selectedTag}
        availableTags={availableTags}
      />

      <main className="pt-16 pb-6 px-2 sm:px-4">
        <div className="max-w-7xl mx-auto relative">
          <NotesGrid
            notes={filteredNotes}
            isListView={isListView}
            loading={loading || paymentLoading}
            onViewToggle={() => setIsListView(!isListView)}
            onNoteEdit={handleNoteEdit}
            onNoteDelete={handleNoteDelete}
          />

          <Button
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg"
            onClick={handleCreateNote}
          >
            <Plus className="h-6 w-6" />
          </Button>

          <NoteEditor
            open={isEditorOpen}
            onClose={() => {
              setIsEditorOpen(false);
              setEditingNote(null);
            }}
            onSave={handleNoteSave}
            initialNote={
              editingNote
                ? {
                    title: editingNote.title,
                    content: editingNote.content,
                    tags: editingNote.tags,
                  }
                : undefined
            }
          />

          <UpgradeDialog
            open={showUpgradeDialog}
            onClose={() => setShowUpgradeDialog(false)}
            remainingNotes={limits?.notesRemaining}
          />
        </div>
      </main>
    </div>
  );
};

export default Home;
