"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, Upload, Download, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MarkdownResponse from "@/components/markdownResponse";

export default function ParsePDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [markdown, setMarkdown] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const { toast } = useToast();
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
      setActiveTab("result");
      toast({
        title: "PDF Parsed Successfully",
        description: "Your PDF has been converted to Markdown.",
      });
    } catch (err) {
      setError("An error occurred while parsing the PDF");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    toast({
      title: "Copied to Clipboard",
      description: "The Markdown content has been copied to your clipboard.",
    });
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "parsed_pdf.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center justify-center">
            <FileText className="mr-2" />
            PDF to Markdown Converter
          </CardTitle>
          <CardDescription className="text-center">
            Upload a PDF file and convert it to Markdown format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload PDF</TabsTrigger>
              <TabsTrigger value="result">Conversion Result</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="flex-grow"
                  />
                  <Button type="submit" disabled={!file || isLoading}>
                    {isLoading ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? "Converting..." : "Convert"}
                  </Button>
                </div>
              </form>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {file && !isLoading && (
                <Alert className="mt-4">
                  <AlertTitle>File Selected</AlertTitle>
                  <AlertDescription>{file.name}</AlertDescription>
                </Alert>
              )}
            </TabsContent>
            <TabsContent value="result">
              {markdown ? (
                <div className="space-y-4">
                  <div className="flex justify-end space-x-2">
                    <Button onClick={handleCopyMarkdown} variant="outline">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button onClick={handleDownloadMarkdown} variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                  <div className="max-h-[70vh] overflow-auto">
                  <MarkdownResponse content={markdown} />
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertTitle>No Content</AlertTitle>
                  <AlertDescription>
                    Convert a PDF to see the result here.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
