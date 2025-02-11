import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import MarkdownEditor from "@uiw/react-markdown-editor";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

interface Tag {
  id: string;
  name: string;
  color?: string;
}

interface NoteEditorProps {
  open?: boolean;
  onClose?: () => void;
  onSave?: (note: { title: string; content: string; tags: Tag[] }) => void;
  initialNote?: {
    title: string;
    content: string;
    tags: Tag[];
  };
}

const NoteEditor = ({
  open = true,
  onClose = () => {},
  onSave = () => {},
  initialNote = {
    title: "",
    content: "",
    tags: [{ id: "1", name: "personal", color: "bg-blue-100 text-blue-800" }],
  },
}: NoteEditorProps) => {
  const [isPreview, setIsPreview] = useState(false);
  const [title, setTitle] = useState(initialNote.title);
  const [content, setContent] = useState(initialNote.content);
  const [tags, setTags] = useState<Tag[]>(initialNote.tags);
  const [newTag, setNewTag] = useState("");

  const handleSave = () => {
    onSave({ title, content, tags });
    onClose();
  };

  const addTag = () => {
    if (newTag.trim()) {
      setTags([...tags, { id: Date.now().toString(), name: newTag.trim() }]);
      setNewTag("");
    }
  };

  const removeTag = (tagId: string) => {
    setTags(tags.filter((tag) => tag.id !== tagId));
  };

  const toolbarButtons = [
    { icon: <Bold size={18} />, text: "Bold" },
    { icon: <Italic size={18} />, text: "Italic" },
    { icon: <List size={18} />, text: "Bullet List" },
    { icon: <ListOrdered size={18} />, text: "Numbered List" },
    { icon: <Quote size={18} />, text: "Quote" },
    { icon: <Code size={18} />, text: "Code" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] w-[95vw] sm:w-[90vw] h-[90vh] sm:h-[80vh] bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle>
            <Input
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold"
            />
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full gap-4">
          <div className="flex items-center gap-2 border-b pb-2">
            {toolbarButtons.map((button, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                {button.icon}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setIsPreview(!isPreview)}
            >
              {isPreview ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" /> Edit
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" /> Preview
                </>
              )}
            </Button>
          </div>

          <div className="flex-1 relative">
            <div
              className={`w-full h-full transition-opacity ${isPreview ? "hidden" : "block"}`}
            >
              <MarkdownEditor
                value={content}
                onChange={(value) => setContent(value)}
                toolbars={[
                  "bold",
                  "italic",
                  "strikethrough",
                  "heading-1",
                  "heading-2",
                  "heading-3",
                  "unordered-list",
                  "ordered-list",
                  "quote",
                  "code",
                  "link",
                  "image",
                ]}
                className="min-h-[300px] flex-1 border rounded-md"
              />
            </div>
            <div
              className={`w-full h-full transition-opacity ${isPreview ? "block" : "hidden"}`}
            >
              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                <MarkdownPreview
                  source={content}
                  className="prose dark:prose-invert"
                />
              </ScrollArea>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Add tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTag()}
              />
              <Button onClick={addTag}>Add Tag</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className={`${tag.color || "bg-gray-100 text-gray-800"}`}
                >
                  {tag.name}
                  <button
                    onClick={() => removeTag(tag.id)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteEditor;
