import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
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
  const [selectedTag, setSelectedTag] = useState("");
  const [availableTags, setAvailableTags] = useState<
    Array<{ id: string; name: string; color?: string }>
  >([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

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
    fetchTags();
    const fetchNotes = async () => {
      try {
        const { data: notesData, error } = await supabase.from("notes").select(`
            *,
            notes_tags!inner(tag_id),
            tags!inner(*)
          `);

        if (error) throw error;

        setNotes(
          notesData.map((note: any) => ({
            id: note.id,
            title: note.title,
            content: note.content,
            tags: note.tags,
            lastModified: new Date(note.updated_at),
          })),
        );
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
  }, []);

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

  const handleNoteSave = async (note: {
    title: string;
    content: string;
    tags: Array<{ id: string; name: string; color?: string }>;
  }) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error("User not authenticated");
      }

      const { data: newNote, error } = await supabase
        .from("notes")
        .insert({
          title: note.title,
          content: note.content,
          user_id: user.data.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      if (note.tags.length > 0) {
        const { error: tagError } = await supabase.from("notes_tags").insert(
          note.tags.map((tag) => ({
            note_id: newNote.id,
            tag_id: tag.id,
          })),
        );

        if (tagError) throw tagError;
      }

      setIsEditorOpen(false);
    } catch (error) {
      console.error("Error saving note:", error);
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
          />

          <Button
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg"
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
