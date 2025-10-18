interface ContentAnalysis {
  totalFiles: number;
  contentTypes: {
    emails: number;
    documents: number;
    videos: number;
    audio: number;
    other: number;
  };
  diversity: {
    emails: number; // percentage
    documents: number;
    videos: number;
    audio: number;
  };
  missingTypes: string[];
  strengths: string[];
  recommendations: string[];
}

interface ContentFile {
  contentType?: string;
  fileName?: string;
  title?: string;
  metadata?: {
    source?: string;
  };
}

export class ContentAnalyzer {
  static analyzeContent(files: ContentFile[]): ContentAnalysis {
    const totalFiles = files.length;

    // Categorize by content type
    const contentTypes = {
      emails: 0,
      documents: 0,
      videos: 0,
      audio: 0,
      other: 0,
    };

    files.forEach((file) => {
      const contentType = file.contentType || "";
      const fileName = file.fileName || file.title || "";
      const source = file.metadata?.source || "";

      if (
        contentType.includes("email") ||
        fileName.includes("sent") ||
        fileName.includes(".mbox") ||
        source.includes("gmail")
      ) {
        contentTypes.emails++;
      } else if (
        contentType.includes("pdf") ||
        contentType.includes("document") ||
        fileName.endsWith(".pdf") ||
        fileName.endsWith(".docx") ||
        fileName.endsWith(".doc")
      ) {
        contentTypes.documents++;
      } else if (
        contentType.includes("video") ||
        fileName.endsWith(".mp4") ||
        fileName.endsWith(".mov") ||
        fileName.endsWith(".avi")
      ) {
        contentTypes.videos++;
      } else if (
        contentType.includes("audio") ||
        fileName.endsWith(".mp3") ||
        fileName.endsWith(".wav") ||
        fileName.endsWith(".m4a")
      ) {
        contentTypes.audio++;
      } else {
        contentTypes.other++;
      }
    });

    // Calculate diversity percentages
    const diversity = {
      emails:
        totalFiles > 0
          ? Math.round((contentTypes.emails / totalFiles) * 100)
          : 0,
      documents:
        totalFiles > 0
          ? Math.round((contentTypes.documents / totalFiles) * 100)
          : 0,
      videos:
        totalFiles > 0
          ? Math.round((contentTypes.videos / totalFiles) * 100)
          : 0,
      audio:
        totalFiles > 0
          ? Math.round((contentTypes.audio / totalFiles) * 100)
          : 0,
    };

    // Identify missing content types
    const missingTypes = [];
    if (contentTypes.emails === 0) missingTypes.push("emails");
    if (contentTypes.documents === 0) missingTypes.push("documents");
    if (contentTypes.videos === 0 && contentTypes.audio === 0)
      missingTypes.push("media");

    // Identify strengths (categories with >30% representation)
    const strengths = [];
    if (diversity.emails > 30) strengths.push("emails");
    if (diversity.documents > 30) strengths.push("documents");
    if (diversity.videos + diversity.audio > 30) strengths.push("media");

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      contentTypes,
      diversity,
      totalFiles
    );

    return {
      totalFiles,
      contentTypes,
      diversity,
      missingTypes,
      strengths,
      recommendations,
    };
  }

  private static generateRecommendations(
    contentTypes: {
      emails: number;
      documents: number;
      videos: number;
      audio: number;
      other: number;
    },
    diversity: {
      emails: number;
      documents: number;
      videos: number;
      audio: number;
    },
    totalFiles: number
  ): string[] {
    const recommendations = [];

    // Gmail recommendation (highest priority if no emails)
    if (contentTypes.emails === 0 && totalFiles < 50) {
      recommendations.push("gmail_import");
    }

    // Content type diversity recommendations
    if (diversity.emails > 70) {
      recommendations.push("add_documents");
    } else if (diversity.documents > 70) {
      recommendations.push("add_emails");
    }

    // Media recommendations
    if (
      contentTypes.videos === 0 &&
      contentTypes.audio === 0 &&
      totalFiles > 10
    ) {
      recommendations.push("add_media");
    }

    // Volume recommendations
    if (totalFiles < 10) {
      recommendations.push("upload_more");
    } else if (totalFiles >= 10 && totalFiles < 25) {
      recommendations.push("keep_momentum");
    } else if (totalFiles >= 25 && totalFiles < 50) {
      recommendations.push("halfway_there");
    }

    return recommendations;
  }

  static getRecommendationMessage(
    recommendation: string,
    context?: { fileCount?: number }
  ): {
    title: string;
    message: string;
    cta: string;
    action: string;
    priority: "high" | "medium" | "low";
  } {
    const messages = {
      gmail_import: {
        title: "💡 10x Your Training: Import Your Gmail Sent Folder",
        message: `You've uploaded ${context?.fileCount || 0} files. Add your Gmail sent folder to give Echo Me hundreds of examples of your writing style. This typically adds 200-500 examples instantly.`,
        cta: "Show Me How",
        action: "gmail_tutorial",
        priority: "high" as const,
      },
      add_documents: {
        title: "📄 Balance Your Content: Add Documents",
        message:
          "Great email examples! Consider adding blog posts, PDFs, or articles to show your long-form thinking and technical depth.",
        cta: "Upload Documents",
        action: "upload_documents",
        priority: "medium" as const,
      },
      add_emails: {
        title: "📧 Add Conversational Examples",
        message:
          "Solid documentation! Consider adding your sent emails for conversational tone and how you communicate with real people.",
        cta: "Import Gmail",
        action: "gmail_tutorial",
        priority: "medium" as const,
      },
      add_media: {
        title: "🎥 Add Your Speaking Voice",
        message:
          "Connect your YouTube channel or upload video/audio to capture your speaking style and presentation skills.",
        cta: "Connect YouTube",
        action: "youtube_connect",
        priority: "medium" as const,
      },
      upload_more: {
        title: "🚀 Quick Start: Upload Your Best Work",
        message:
          "Start with 3-5 of your best-performing emails or articles. This gives Echo Me a foundation to learn from.",
        cta: "Upload Files",
        action: "knowledge_base",
        priority: "high" as const,
      },
      keep_momentum: {
        title: "🔥 You're on Fire! Keep Going!",
        message: `You're ${Math.round(((context?.fileCount || 0) / 100) * 100)}% to optimal training. Add ${100 - (context?.fileCount || 0)} more files to unlock Echo Me's full potential.`,
        cta: "Upload More",
        action: "knowledge_base",
        priority: "low" as const,
      },
      halfway_there: {
        title: "⭐ Halfway to Perfect!",
        message:
          "Your AI brain is getting strong. Add more diverse content to reach maximum quality.",
        cta: "Keep Uploading",
        action: "knowledge_base",
        priority: "low" as const,
      },
    };

    return (
      messages[recommendation as keyof typeof messages] || {
        title: "Keep Building",
        message:
          "Continue adding content to improve Echo Me's understanding of your voice.",
        cta: "Upload More",
        action: "knowledge_base",
        priority: "low" as const,
      }
    );
  }
}
