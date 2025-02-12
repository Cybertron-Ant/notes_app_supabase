import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./auth/AuthProvider";
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
  const { user } = useAuth();
  const [isListView, setIsListView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [availableTags, setAvailableTags] = useState<
    Array<{ id: string; name: string; color?: string }>
  >([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const fetchTags = async () => {
    try {
      const { data: tags, error } = await supabase.from("tags").select("*");

      if (error) throw error;
      setAvailableTags(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchTags();
    const fetchNotes = async () => {
      try {
        const { data: notesData, error } = await supabase.from("notes").select(`
            *,
            notes_tags(tag_id),
            tags(id, name, color)
          `);

        if (error) throw error;

        if (notesData) {
          const formattedNotes = notesData.map((note: any) => ({
            id: note.id,
            title: note.title,
            content: note.content,
            tags: note.tags || [],
            lastModified: new Date(note.updated_at || note.created_at),
          }));
          setNotes(formattedNotes);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();

    // Subscribe to realtime changes for all relevant tables
    const channel = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notes" },
        () => fetchNotes(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notes_tags" },
        () => fetchNotes(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tags" },
        () => fetchNotes(),
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

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

  const handleViewToggle = (view: "grid" | "list") => {
    setIsListView(view === "list");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleNoteEdit = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      setEditingNote(note);
      setIsEditorOpen(true);
    }
  };

  const handleNoteDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("notes").delete().eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleNoteSave = async (noteData: {
    title: string;
    content: string;
    tags: Array<{ id: string; name: string; color?: string }>;
  }) => {
    try {
      if (!user) {
        throw new Error("Please sign in to create or edit notes");
      }

      if (editingNote) {
        // Update existing note
        const { error: noteError } = await supabase
          .from("notes")
          .update({
            title: noteData.title,
            content: noteData.content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingNote.id);

        if (noteError) throw noteError;

        // Update tags
        await supabase
          .from("notes_tags")
          .delete()
          .eq("note_id", editingNote.id);

        if (noteData.tags.length > 0) {
          const { error: tagError } = await supabase.from("notes_tags").insert(
            noteData.tags.map((tag) => ({
              note_id: editingNote.id,
              tag_id: tag.id,
            })),
          );

          if (tagError) throw tagError;
        }
      } else {
        // Create new note
        const { data: newNote, error: noteError } = await supabase
          .from("notes")
          .insert({
            title: noteData.title,
            content: noteData.content,
            user_id: user.id,
          })
          .select()
          .single();

        if (noteError) throw noteError;

        if (noteData.tags.length > 0) {
          const { error: tagError } = await supabase.from("notes_tags").insert(
            noteData.tags.map((tag) => ({
              note_id: newNote.id,
              tag_id: tag.id,
            })),
          );

          if (tagError) throw tagError;
        }
      }

      setIsEditorOpen(false);
      setEditingNote(null);
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Error saving note: " + (error as Error).message);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesTag =
      !selectedTag || note.tags.some((tag) => tag.id === selectedTag);

    return matchesSearch && matchesTag;
  });

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
            loading={loading}
            onViewToggle={() => setIsListView(!isListView)}
            onNoteEdit={handleNoteEdit}
            onNoteDelete={handleNoteDelete}
          />

          <Button
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg"
            onClick={() => setIsEditorOpen(true)}
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
        </div>
      </main>
    </div>
  );
};

export default Home;
