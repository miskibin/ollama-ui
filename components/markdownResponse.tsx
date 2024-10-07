// components/MarkdownResponse.tsx
import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownResponseProps {
  content: string;
}

const MarkdownResponse: React.FC<MarkdownResponseProps> = ({ content }) => {
  return (
    <ReactMarkdown
      className={"prose"}
      components={{
        code({
          inline,
          className,
          children,
          ...props
        }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) {
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownResponse;
