import MarkdownEditor from "@/components/markdown-editor";
import { Analytics } from "@vercel/analytics/react";

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      {/* <h1 className="text-3xl font-bold mb-4"> Online Markdown Reader</h1> */}
      <MarkdownEditor />

      <Analytics />
    </main>
  );
}
