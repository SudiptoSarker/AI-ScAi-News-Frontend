import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Button } from "@mui/material";

import dynamic from "next/dynamic";
const SyntaxHighlighter = dynamic(() => import("react-syntax-highlighter").then((mod) => mod.Prism), { ssr: false });

const codeBlockStyle = {
  backgroundColor: "#282c34",
  color: "#f8f8f2",
  padding: "1em",
  borderRadius: "4px",
  overflowX: "auto",
  fontFamily: 'Consolas, "Courier New", monospace',
};

interface MarkdownRendererProps {
  text: string;
}

export default function MarkdownRenderer({ text }: MarkdownRendererProps) {
  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "python";
      return !inline ? (
        <div style={{ position: "relative" }}>
          <SyntaxHighlighter className={codeBlockStyle} language={language} PreTag="div">
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
          <CopyToClipboard text={String(children).trim()}>
            <Button style={{ position: "absolute", top: 0, right: 0 }}>Copy</Button>
          </CopyToClipboard>
        </div>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {text}
    </ReactMarkdown>
  );
}
