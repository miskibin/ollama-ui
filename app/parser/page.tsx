"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload } from "lucide-react";

export default function ParsePDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [markdown, setMarkdown] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to parse PDF");
      }

      const data = await response.json();
      setMarkdown(data.markdown);
    } catch (err) {
      setError("An error occurred while parsing the PDF");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            <FileText className="inline-block mr-2" />
            PDF to Markdown Parser
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input type="file" accept=".pdf" onChange={handleFileChange} />
            </div>
            <Button
              type="submit"
              disabled={!file || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Parse PDF
                </>
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {markdown && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Parsed Markdown:</h3>
              <Textarea
                value={markdown}
                readOnly
                className="w-full h-64 p-2 border rounded"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
