import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Grid, List, Sun, Moon } from "lucide-react";
import LoginButton from "./auth/LoginButton";
import { useTheme } from "../lib/utils";

interface HeaderProps {
  onViewToggle?: (view: "grid" | "list") => void;
  onSearch?: (query: string) => void;
  currentView?: "grid" | "list";
  onTagFilter?: (tag: string) => void;
  selectedTag?: string;
  availableTags?: Array<{ id: string; name: string; color?: string }>;
}

const Header = ({
  onViewToggle = () => {},
  onSearch = () => {},
  currentView = "grid",
  onTagFilter = () => {},
  selectedTag,
  availableTags = [],
}: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="w-full h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 fixed top-0 z-10">
      <div className="max-w-7xl mx-auto h-full flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
        <div className="w-full sm:flex-1 sm:max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 max-w-full">
          <Button
            variant={!selectedTag ? "default" : "outline"}
            size="sm"
            onClick={() => onTagFilter("")}
            className="whitespace-nowrap"
          >
            All Notes
          </Button>
          {availableTags.map((tag) => (
            <Button
              key={tag.id}
              variant={selectedTag === tag.id ? "default" : "outline"}
              size="sm"
              onClick={() => onTagFilter(tag.id)}
              className={`whitespace-nowrap ${tag.color || ""}`}
            >
              {tag.name}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg">
            <Button
              variant={currentView === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewToggle("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={currentView === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewToggle("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <LoginButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
