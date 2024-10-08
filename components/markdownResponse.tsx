// components/MarkdownResponse.tsx
import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownResponseProps {
  content: string;
}

const MarkdownResponse: React.FC<MarkdownResponseProps> = ({ content }) => {
  return <ReactMarkdown className={"prose dark:prose-invert"}>{content}</ReactMarkdown>;
};

export default MarkdownResponse;
