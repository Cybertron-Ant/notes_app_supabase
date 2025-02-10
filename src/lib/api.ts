import { supabase } from "./supabase";
import { Database } from "../types/supabase";

type Note = Database["public"]["Tables"]["notes"]["Row"];
type Tag = Database["public"]["Tables"]["tags"]["Row"];
type NoteWithTags = Note & { tags: Tag[] };

export const api = {
  notes: {
    async list(): Promise<NoteWithTags[]> {
      const { data: notes, error } = await supabase.from("notes").select(`
          *,
          notes_tags!inner(tag_id),
          tags!inner(*)
        `);

      if (error) throw error;
      return notes as NoteWithTags[];
    },

    async create(note: { title: string; content: string; tags: string[] }) {
      const { data: newNote, error: noteError } = await supabase
        .from("notes")
        .insert({
          title: note.title,
          content: note.content,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (noteError) throw noteError;

      if (note.tags.length > 0) {
        const { error: tagError } = await supabase.from("notes_tags").insert(
          note.tags.map((tagId) => ({
            note_id: newNote.id,
            tag_id: tagId,
          })),
        );

        if (tagError) throw tagError;
      }

      return newNote;
    },

    async update(
      id: string,
      note: { title?: string; content?: string; tags?: string[] },
    ) {
      const { error: noteError } = await supabase
        .from("notes")
        .update({
          title: note.title,
          content: note.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (noteError) throw noteError;

      if (note.tags) {
        // Remove existing tags
        await supabase.from("notes_tags").delete().eq("note_id", id);

        // Add new tags
        if (note.tags.length > 0) {
          const { error: tagError } = await supabase.from("notes_tags").insert(
            note.tags.map((tagId) => ({
              note_id: id,
              tag_id: tagId,
            })),
          );

          if (tagError) throw tagError;
        }
      }
    },

    async delete(id: string) {
      const { error } = await supabase.from("notes").delete().eq("id", id);

      if (error) throw error;
    },
  },

  tags: {
    async list(): Promise<Tag[]> {
      const { data: tags, error } = await supabase.from("tags").select("*");

      if (error) throw error;
      return tags;
    },

    async create(tag: { name: string; color?: string }) {
      const { data, error } = await supabase
        .from("tags")
        .insert(tag)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  },
};
