"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "next-themes";
import { Moon, Sun, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { renderToString } from "react-dom/server";

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState("# Hello, Markdown!");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMarkdown(e.target.value);
    },
    []
  );

  const handleDownload = useCallback(
    (type: "markdown" | "html" | "text") => {
      let content = markdown;
      let fileType = "text/markdown";
      let fileExtension = "md";

      if (type === "html") {
        const htmlContent = renderToString(
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        );
        content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Content</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
      pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
      code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
      img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
        fileType = "text/html";
        fileExtension = "html";
      } else if (type === "text") {
        fileType = "text/plain";
        fileExtension = "txt";
      }

      const blob = new Blob([content], { type: fileType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `markdown.${fileExtension}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [markdown]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold">
          Online Markdown Editor and Previewer
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </header>
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="flex flex-col">
          <Textarea
            className="flex-grow min-h-[500px] font-mono"
            value={markdown}
            onChange={handleInputChange}
            placeholder="Write your markdown here..."
          />
        </div>
        <div className="border rounded p-4 min-h-[500px] overflow-auto prose dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t gap-2">
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 w-full sm:w-auto">
          <Button
            onClick={() => handleDownload("markdown")}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" /> Download Markdown
          </Button>
          <Button
            onClick={() => handleDownload("html")}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" /> Download HTML
          </Button>
          <Button
            onClick={() => handleDownload("text")}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" /> Download Text
          </Button>
        </div>
      </div>
      <footer className="text-center p-4 border-t">
        <a
          href="https://github.com/rocketscience755"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Made with ❤️ and ☕️ by Subhojit Karmakar
        </a>
      </footer>
    </div>
  );
}
