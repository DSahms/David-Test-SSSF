"use client";
import ReactMarkdown from "react-markdown";

export function MarkdownView({ children, className }: { children: string; className?: string }) {
  return (
    <div className={"sssf-md " + (className || "")}>
      <ReactMarkdown>{children || ""}</ReactMarkdown>
    </div>
  );
}
