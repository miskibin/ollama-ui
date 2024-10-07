// components/MarkdownResponse.tsx
import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownResponseProps {
  content: string;
}

const MarkdownResponse: React.FC<MarkdownResponseProps> = ({ content }) => {
  return <ReactMarkdown className={"prose"}>{content}</ReactMarkdown>;
};

export default MarkdownResponse;
