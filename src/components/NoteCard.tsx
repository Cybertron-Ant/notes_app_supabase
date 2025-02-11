import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
import { MoreVertical, Edit2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface Tag {
  id: string;
  name: string;
  color?: string;
}

interface NoteCardProps {
  id?: string;
  title?: string;
  content?: string;
  tags?: Tag[];
  lastModified?: Date;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const NoteCard = ({
  id = "1",
  title = "Sample Note",
  content = "This is a sample note content. It can contain markdown and will be truncated if it gets too long...",
  tags = [
    { id: "1", name: "personal", color: "bg-blue-100 text-blue-800" },
    { id: "2", name: "work", color: "bg-green-100 text-green-800" },
  ],
  lastModified = new Date(),
  onEdit = () => {},
  onDelete = () => {},
}: NoteCardProps) => {
  return (
    <Card className="w-full max-w-[340px] mx-auto h-[280px] bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold truncate">
            {title}
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>More options</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="text-sm text-gray-500">
          {format(lastModified, "MMM d, yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm line-clamp-4">{content}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2">
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className={`${tag.color || "bg-gray-100 text-gray-800"}`}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2"
          onClick={() => onEdit(id)}
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Note
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NoteCard;
