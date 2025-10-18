import { useState, useEffect } from "react";
import {
  knowledgeBaseService,
  KnowledgeBaseContent,
} from "@/services/knowledge-base";
import { ContentAnalyzer } from "@/utils/content-analyzer";

export function useContentAnalysis() {
  const [content, setContent] = useState<KnowledgeBaseContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await knowledgeBaseService.getContent({
          limit: 1000, // Get all content for analysis
        });

        setContent(response.data || []);
      } catch (err) {
        console.error("Error fetching content for analysis:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch content"
        );
        setContent([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();

    // Refresh analysis every 2 minutes
    const interval = setInterval(fetchContent, 120000);

    return () => clearInterval(interval);
  }, []);

  const analysis =
    content.length > 0 ? ContentAnalyzer.analyzeContent(content) : null;

  return {
    analysis,
    isLoading,
    hasContent: content.length > 0,
    error,
  };
}
