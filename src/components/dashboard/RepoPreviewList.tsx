import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { File, Folder, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";

export interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  path: string;
}

interface RepoPreviewListProps {
  files: FileNode[];
  repoName: string;
  className?: string;
}

function FileTreeNode({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const hasChildren = node.type === "folder" && node.children && node.children.length > 0;

  return (
    <div>
      <button
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center gap-2 py-1.5 px-2 rounded-md text-sm transition-colors duration-120",
          "hover:bg-secondary/80 text-left",
          hasChildren && "cursor-pointer",
          !hasChildren && node.type === "folder" && "cursor-default"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren && (
          <span className="text-muted-foreground">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </span>
        )}
        {!hasChildren && node.type === "folder" && <span className="w-3" />}
        
        {node.type === "folder" ? (
          <Folder className="w-4 h-4 text-primary shrink-0" />
        ) : (
          <File className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <span className={cn(
          "truncate",
          node.type === "folder" ? "font-medium text-foreground" : "text-muted-foreground"
        )}>
          {node.name}
        </span>
      </button>
      
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child, index) => (
            <FileTreeNode key={`${child.path}-${index}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function RepoPreviewList({ files, repoName, className }: RepoPreviewListProps) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card", className)}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30 rounded-t-2xl">
        <Folder className="w-4 h-4 text-primary" />
        <span className="font-medium text-foreground">{repoName}</span>
        <span className="text-xs text-muted-foreground">
          ({files.reduce((acc, f) => acc + (f.type === "file" ? 1 : countFiles(f)), 0)} files)
        </span>
      </div>
      <ScrollArea className="h-64">
        <div className="py-2">
          {files.map((file, index) => (
            <FileTreeNode key={`${file.path}-${index}`} node={file} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function countFiles(node: FileNode): number {
  if (node.type === "file") return 1;
  if (!node.children) return 0;
  return node.children.reduce((acc, child) => acc + countFiles(child), 0);
}
