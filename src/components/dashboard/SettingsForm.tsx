import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Eye } from "lucide-react";

interface SettingsFormProps {
  repoName: string;
  onRepoNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  isPrivate: boolean;
  onPrivateChange: (value: boolean) => void;
  genre: string;
  onGenreChange: (value: string) => void;
  commitCount: number;
  onCommitCountChange: (value: number) => void;
  humanization: string;
  onHumanizationChange: (value: string) => void;
  onPreview: () => void;
  isLoading?: boolean;
}

export function SettingsForm({
  repoName,
  onRepoNameChange,
  description,
  onDescriptionChange,
  isPrivate,
  onPrivateChange,
  genre,
  onGenreChange,
  commitCount,
  onCommitCountChange,
  humanization,
  onHumanizationChange,
  onPreview,
  isLoading = false,
}: SettingsFormProps) {
  return (
    <div className="space-y-6">
      {/* Repository Name */}
      <div className="space-y-2">
        <Label htmlFor="repoName" className="text-sm font-medium">
          Repository Name
        </Label>
        <Input
          id="repoName"
          value={repoName}
          onChange={(e) => onRepoNameChange(e.target.value)}
          placeholder="my-awesome-project"
          className="h-11"
        />
      </div>

      {/* Project Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Project Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe your project to help AI generate relevant code, commits, and content... (e.g., A REST API for managing tasks with authentication and real-time updates)"
          className="min-h-[100px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          AI will use this description to generate contextually appropriate code and commits
        </p>
      </div>

      {/* Visibility Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">Private Repository</Label>
          <p className="text-xs text-muted-foreground">
            Only you will be able to see this repository
          </p>
        </div>
        <Switch checked={isPrivate} onCheckedChange={onPrivateChange} />
      </div>

      {/* Genre Dropdown */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Project Genre</Label>
        <Select value={genre} onValueChange={onGenreChange}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Select a genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="web">Web Application</SelectItem>
            <SelectItem value="cli">CLI Tool</SelectItem>
            <SelectItem value="data">Data Science</SelectItem>
            <SelectItem value="api">REST API</SelectItem>
            <SelectItem value="library">Library / Package</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Target Commits */}
      <div className="space-y-2">
        <Label htmlFor="commitCount" className="text-sm font-medium">
          Target Commits
        </Label>
        <Input
          id="commitCount"
          type="number"
          min={5}
          max={100}
          value={commitCount}
          onChange={(e) => onCommitCountChange(Number(e.target.value))}
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">
          Between 5 and 100 commits
        </p>
      </div>

      {/* Humanization Level */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Humanization Level</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs p-3" side="right">
              <p className="text-sm font-medium mb-2">
                Humanization controls how many small vs big commits are made.
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  <strong className="text-foreground">Sparse:</strong> Few large commits, spread over days
                </p>
                <p>
                  <strong className="text-foreground">Medium:</strong> Balanced mix of commit sizes
                </p>
                <p>
                  <strong className="text-foreground">Busy:</strong> Many small commits, more frequent
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <Select value={humanization} onValueChange={onHumanizationChange}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Select humanization level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sparse">Sparse (Fewer, larger commits)</SelectItem>
            <SelectItem value="medium">Medium (Balanced)</SelectItem>
            <SelectItem value="busy">Busy (Many small commits)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Preview Button */}
      <Button
        variant="outline"
        className="w-full h-11 gap-2"
        onClick={onPreview}
        disabled={isLoading || !repoName.trim()}
      >
        <Eye className="w-4 h-4" />
        Preview plan
      </Button>
    </div>
  );
}
