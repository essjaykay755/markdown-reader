"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "next-themes";
import { Moon, Sun, Bold, Italic, Link, Image, Code, ListOrdered, List, Heading1, Heading2, Heading3, Quote, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { renderToString } from "react-dom/server";

const DEMO_MARKDOWN = `# Welcome to Markdown Editor

## About
This is a modern markdown editor with live preview and export options. You can edit your markdown on the left and see the preview on the right in real-time.

## Features
- **Live Preview**: See your changes instantly
- **Export Options**: Download as Markdown, HTML, Text, or PDF
- **Markdown Shortcuts**: Use the toolbar for quick formatting
- **Dark Mode**: Toggle between light and dark themes

## Markdown Examples

### Text Formatting
You can make text **bold**, *italic*, or ***both***. You can also ~~strike through~~ text.

### Lists
#### Ordered List
1. First item
2. Second item
3. Third item

#### Unordered List
- Apple
- Banana
- Cherry

### Code
You can include \`inline code\` or code blocks:

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\`

### Links and Images
[Visit GitHub](https://github.com)

![Sample Image](https://picsum.photos/300/200)

### Blockquotes
> This is a blockquote.
> It can span multiple lines.

### Tables
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

---

Try editing this content or create your own!
`;

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(DEMO_MARKDOWN);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [splitPos, setSplitPos] = useState(50); // Store split position as percentage
  const isDraggingRef = useRef(false);

  // Add resize handler
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    const container = document.getElementById('editor-container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const newSplitPos = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Limit the split position between 20% and 80%
    const limitedSplitPos = Math.min(Math.max(newSplitPos, 20), 80);
    setSplitPos(limitedSplitPos);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  // Cleanup event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMarkdown(e.target.value);
      setSelectionStart(e.target.selectionStart);
      setSelectionEnd(e.target.selectionEnd);
    },
    []
  );

  const handleTextareaSelect = useCallback(
    (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
      const target = e.target as HTMLTextAreaElement;
      setSelectionStart(target.selectionStart);
      setSelectionEnd(target.selectionEnd);
    },
    []
  );

  const insertMarkdown = useCallback(
    (before: string, after: string = '') => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const newSelectionStart = selectionStart;
      const newSelectionEnd = selectionEnd;
      const selectedText = markdown.substring(newSelectionStart, newSelectionEnd);
      
      const newMarkdown = 
        markdown.substring(0, newSelectionStart) + 
        before + 
        selectedText + 
        after + 
        markdown.substring(newSelectionEnd);
      
      setMarkdown(newMarkdown);
      
      // Focus back to textarea after state update
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          const newCursorPos = newSelectionStart + before.length + selectedText.length + after.length;
          textarea.setSelectionRange(
            selectedText ? newSelectionStart : newSelectionStart + before.length,
            selectedText ? newSelectionEnd + before.length + after.length : newSelectionStart + before.length
          );
        }
      }, 0);
    },
    [markdown, selectionStart, selectionEnd]
  );

  const handleDownload = useCallback(
    async (type: "markdown" | "html" | "text" | "pdf") => {
      let content = markdown;
      let fileType = "text/markdown";
      let fileExtension = "md";

      if (type === "pdf") {
        // Only import html2pdf.js on the client side when needed
        const html2pdf = (await import('html2pdf.js')).default;
        
        const htmlContent = renderToString(
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        );
        const styledHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Content</title>
    <style>
      body { 
        font-family: Arial, sans-serif; 
        line-height: 1.6; 
        padding: 40px; 
        max-width: 800px; 
        margin: 0 auto; 
        color: #000000; 
        background-color: #ffffff; 
      }
      pre { 
        background-color: #f4f4f4; 
        padding: 16px; 
        border-radius: 5px; 
        overflow-x: auto;
        color: #000000;
        margin: 20px 0;
        white-space: pre-wrap;
        word-break: break-word;
      }
      code { 
        background-color: #f4f4f4; 
        padding: 2px 4px; 
        border-radius: 3px;
        color: #000000;
      }
      img { 
        max-width: 100%; 
        height: auto; 
        margin: 20px 0;
        display: block;
      }
      h1, h2, h3, h4, h5, h6 {
        color: #000000;
        margin-top: 28px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
      }
      h1 { font-size: 2em; }
      h2 { font-size: 1.5em; }
      h3 { font-size: 1.25em; }
      p, li, a, blockquote, table, th, td {
        color: #000000;
        margin-bottom: 16px;
      }
      a {
        color: #0366d6;
        text-decoration: underline;
      }
      blockquote {
        border-left: 4px solid #ccc;
        padding: 0 16px;
        margin-left: 0;
        margin-right: 0;
        margin-top: 16px;
        margin-bottom: 16px;
      }
      ul, ol {
        padding-left: 2em;
        margin-top: 0;
        margin-bottom: 16px;
      }
      li {
        margin-bottom: 8px;
      }
      li + li {
        margin-top: 0.25em;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 20px 0;
        overflow: auto;
      }
      table th {
        font-weight: 600;
        text-align: left;
      }
      table th, table td {
        padding: 8px 16px;
        border: 1px solid #dfe2e5;
      }
      table tr {
        background-color: #fff;
        border-top: 1px solid #c6cbd1;
      }
      table tr:nth-child(2n) {
        background-color: #f6f8fa;
      }
      hr {
        height: 0.25em;
        padding: 0;
        margin: 24px 0;
        background-color: #e1e4e8;
        border: 0;
      }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
        
        // Create a temporary div to hold our HTML content
        const element = document.createElement('div');
        element.innerHTML = styledHtml;
        document.body.appendChild(element);
        
        // Configure html2pdf options
        const opt = {
          margin: [15, 15, 15, 15],
          filename: 'markdown.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2, 
            letterRendering: true,
            useCORS: true,
            logging: true
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // Wait for images to load before generating PDF
        const waitForImagesToLoad = new Promise((resolve) => {
          const images = element.querySelectorAll('img');
          if (images.length === 0) {
            resolve(true);
            return;
          }
          
          let loadedImages = 0;
          const onImageLoad = () => {
            loadedImages++;
            if (loadedImages === images.length) {
              resolve(true);
            }
          };
          
          images.forEach(img => {
            if (img.complete) {
              onImageLoad();
            } else {
              img.onload = onImageLoad;
              img.onerror = onImageLoad; // Continue even if image fails to load
            }
            
            // Set crossOrigin attribute for CORS
            img.crossOrigin = "Anonymous";
          });
          
          // Add a timeout in case images don't load
          setTimeout(() => resolve(true), 3000);
        });
        
        // Generate and download PDF after images load
        await waitForImagesToLoad;
        html2pdf().from(element).set(opt).save().then(() => {
          // Remove the temporary element
          document.body.removeChild(element);
        });
        
        return;
      } else if (type === "html") {
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
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-gray-50 dark:bg-[#141312]">
      <header className="flex justify-between items-center px-6 py-4 border-b backdrop-blur-sm bg-white/70 dark:bg-[#141312]/90 sticky top-0 z-30 w-full">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-lg bg-[#e6a900] dark:bg-[#FFBE1A] flex items-center justify-center mr-3 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1c1918" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
          </div>
          <h1 className="text-2xl font-bold text-[#e6a900] dark:text-[#FFBE1A]">
            Markdown Editor
          </h1>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </header>
      
      <div className="px-6 py-2 border-b bg-white/70 dark:bg-[#141312]/90 backdrop-blur-sm overflow-x-auto sticky top-[72px] z-20 w-full shadow-sm">
        <div className="flex space-x-1 items-center w-full">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => insertMarkdown('# ')}
            title="Heading 1"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => insertMarkdown('## ')}
            title="Heading 2"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => insertMarkdown('### ')}
            title="Heading 3"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => insertMarkdown('**', '**')}
            title="Bold"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => insertMarkdown('*', '*')}
            title="Italic"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => insertMarkdown('[', '](https://)')}
            title="Link"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Link className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => insertMarkdown('![alt text](', ')')}
            title="Image"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Image className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => insertMarkdown('```\n', '\n```')}
            title="Code Block"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => insertMarkdown('> ')}
            title="Quote"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => insertMarkdown('1. ')}
            title="Ordered List"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => insertMarkdown('- ')}
            title="Unordered List"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Main content container for editor/preview area */}
      <div className="flex-grow w-full flex flex-col">
        <div id="editor-container" className="flex-grow flex gap-0 p-6 bg-gray-50 dark:bg-[#141312] w-full relative">
          <div className="flex flex-col" style={{ width: `${splitPos}%` }}>
            <div className="p-2 bg-white dark:bg-[#1c1918] rounded-t-lg border-t border-x border-gray-200 dark:border-gray-800 flex items-center">
              <div className="flex space-x-1.5 ml-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="ml-4 text-sm text-gray-500 dark:text-gray-400">Markdown</div>
            </div>
            <Textarea
              ref={textareaRef}
              className="flex-grow min-h-[calc(100vh-240px)] font-mono text-sm rounded-none rounded-b-lg border-b border-x border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1c1918] resize-none shadow-md focus-visible:ring-1 focus-visible:ring-purple-500 focus-visible:ring-offset-0"
              value={markdown}
              onChange={handleInputChange}
              onSelect={handleTextareaSelect}
              placeholder="Write your markdown here..."
            />
          </div>

          {/* Resizable Handle */}
          <div
            className="w-2 hover:w-3 mx-1 my-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-col-resize rounded-full transition-all duration-150 opacity-50 hover:opacity-100"
            onMouseDown={handleMouseDown}
          />

          <div className="flex flex-col" style={{ width: `${100 - splitPos}%` }}>
            <div className="p-2 bg-white dark:bg-[#1c1918] rounded-t-lg border-t border-x border-gray-200 dark:border-gray-800 flex items-center">
              <div className="flex space-x-1.5 ml-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="ml-4 text-sm text-gray-500 dark:text-gray-400">Preview</div>
            </div>
            <div className="border rounded-none rounded-b-lg p-6 min-h-[calc(100vh-240px)] overflow-auto prose dark:prose-invert max-w-none bg-white dark:bg-[#1c1918] border-b border-x border-gray-200 dark:border-gray-800 shadow-md">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t dark:border-gray-800 bg-white/70 dark:bg-[#141312]/90 backdrop-blur-sm gap-3 w-full">
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 w-full sm:w-auto">
          <Button
            onClick={() => handleDownload("markdown")}
            className="w-full sm:w-auto bg-[#FFBE1A] hover:bg-[#e6a900] text-[#1c1918] shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Download className="h-4 w-4 mr-2 text-[#1c1918]" />
            Markdown
          </Button>
          <Button
            onClick={() => handleDownload("html")}
            className="w-full sm:w-auto bg-[#FFBE1A] hover:bg-[#e6a900] text-[#1c1918] shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Download className="h-4 w-4 mr-2 text-[#1c1918]" />
            HTML
          </Button>
          <Button
            onClick={() => handleDownload("text")}
            className="w-full sm:w-auto bg-[#FFBE1A] hover:bg-[#e6a900] text-[#1c1918] shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Download className="h-4 w-4 mr-2 text-[#1c1918]" />
            Text
          </Button>
          <Button
            onClick={() => handleDownload("pdf")}
            className="w-full sm:w-auto bg-[#FFBE1A] hover:bg-[#e6a900] text-[#1c1918] shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Download className="h-4 w-4 mr-2 text-[#1c1918]" />
            PDF
          </Button>
        </div>
      </div>
      
      <footer className="text-center py-4 px-6 border-t dark:border-gray-800 bg-white/70 dark:bg-[#141312]/90 backdrop-blur-sm w-full">
        <div className="max-w-[1800px] mx-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Made with 
            <span className="mx-1">❤️</span> 
            and 
            <span className="mx-1">☕️</span> 
            by&nbsp;
            <a
              href="https://github.com/essjaykay755"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FFBE1A] hover:text-[#e6a900] hover:underline font-medium"
            >
              Subhojit Karmakar
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
