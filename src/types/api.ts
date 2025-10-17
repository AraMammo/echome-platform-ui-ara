// export interface PaginationInfo {
//   limit: number;
//   offset: number;
//   total: number;
//   hasMore: boolean;
// }

// export interface ApiErrorResponse {
//   error: string;
//   statusCode: number;
//   timestamp: string;
// }

// export interface InitiateAuthRequest {
//   email: string;
// }

// export interface InitiateAuthResponse {
//   message: string;
//   sessionId?: string;
// }

// export interface VerifyAuthRequest {
//   email: string;
//   code: string;
// }

// export interface VerifyAuthResponse {
//   accessToken: string;
//   refreshToken: string;
//   expiresIn: number;
//   tokenType: string;
// }

// export interface RefreshTokensRequest {
//   refreshToken: string;
// }

// export interface RefreshTokensResponse {
//   accessToken: string;
//   refreshToken: string;
//   expiresIn: number;
//   tokenType: string;
// }

// export interface ResendCodeRequest {
//   email: string;
// }

// export interface ResendCodeResponse {
//   message: string;
// }

// export interface UserProfile {
//   id: string;
//   email: string;
//   firstName?: string;
//   lastName?: string;
//   profilePicture?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface UpdateUserRequest {
//   firstName?: string;
//   lastName?: string;
//   profilePicture?: string;
// }

// export interface ProfilePictureUploadResponse {
//   message: string;
//   profilePictureUrl: string;
// }

// export interface FileUploadUrlRequest {
//   fileName: string;
//   contentType: string;
// }

// export interface FileUploadUrlResponse {
//   uploadUrl: string;
//   fileId: string;
//   key: string;
// }

// export interface FileDownloadUrlResponse {
//   downloadUrl: string;
//   fileName: string;
//   contentType: string;
// }

// export interface MediaFile {
//   id: string;
//   fileName: string;
//   contentType: string;
//   size: number;
//   uploadedAt: string;
//   status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
//   metadata?: {
//     duration?: number;
//     dimensions?: {
//       width: number;
//       height: number;
//     };
//     format?: string;
//   };
// }

// export interface MediaFilesResponse {
//   data: MediaFile[];
//   pagination: PaginationInfo;
// }

// export interface MediaFileMetadata extends MediaFile {
//   processingStatus: string;
//   extractedData?: Record<string, unknown>;
//   thumbnails?: string[];
//   previewUrl?: string;
// }

// export interface MediaTransformRequest {
//   fileId: string;
//   transformations: MediaTransformation[];
// }

// export interface MediaTransformation {
//   type: "resize" | "convert" | "thumbnail" | "watermark";
//   config: {
//     width?: number;
//     height?: number;
//     format?: string;
//     quality?: number;
//     watermarkText?: string;
//     watermarkPosition?: string;
//   };
// }

// export interface MediaTransformResponse {
//   jobId: string;
//   status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
//   message: string;
// }

// export interface KnowledgeBaseContent {
//   id: string;
//   title: string;
//   contentType: "transcript" | "pdf" | "generated";
//   content: string;
//   metadata: {
//     source?: string;
//     createdAt: string;
//     updatedAt: string;
//     tags?: string[];
//     author?: string;
//   };
//   vectorEmbedding?: number[];
// }

// export interface KnowledgeBaseContentResponse {
//   data: KnowledgeBaseContent[];
//   pagination: PaginationInfo;
// }

// export interface KnowledgeBaseSearchRequest {
//   query: string;
//   contentType?: "transcript" | "pdf" | "generated";
//   limit?: number;
//   offset?: number;
// }

// export interface KnowledgeBaseSearchResult extends KnowledgeBaseContent {
//   relevanceScore: number;
//   matchedSnippets: string[];
// }

// export interface KnowledgeBaseSearchResponse {
//   data: KnowledgeBaseSearchResult[];
//   pagination: PaginationInfo;
// }

// export interface VectorSearchRequest {
//   query: string;
//   topK?: number;
//   filter?: Record<string, string | number | boolean | string[]>;
//   includeMetadata?: boolean;
// }

// export interface VectorSearchResult {
//   id: string;
//   score: number;
//   metadata?: Record<string, string | number | boolean | string[]>;
//   content?: string;
// }

// export interface VectorSearchResponse {
//   results: VectorSearchResult[];
//   totalResults: number;
// }

// export interface TranscriptionJob {
//   id: string;
//   fileId: string;
//   fileName: string;
//   status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
//   createdAt: string;
//   updatedAt: string;
//   result?: {
//     transcript: string;
//     confidence: number;
//     language: string;
//     duration: number;
//   };
//   error?: string;
// }

// export interface TranscriptionJobsResponse {
//   data: TranscriptionJob[];
//   pagination: PaginationInfo;
// }

// export interface PdfProcessingJob {
//   id: string;
//   fileId: string;
//   fileName: string;
//   status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
//   createdAt: string;
//   updatedAt: string;
//   result?: {
//     extractedText: string;
//     metadata: {
//       pageCount: number;
//       title?: string;
//       author?: string;
//       subject?: string;
//       creator?: string;
//     };
//     images?: string[];
//     tables?: Array<{
//       headers: string[];
//       rows: string[][];
//       caption?: string;
//     }>;
//   };
//   error?: string;
// }

// export interface PdfJobsResponse {
//   data: PdfProcessingJob[];
//   pagination: PaginationInfo;
// }

// export interface GeneratedContent {
//   id: string;
//   contentType: string;
//   title: string;
//   content: string;
//   prompt: string;
//   model: string;
//   createdAt: string;
//   metadata: {
//     tokens?: number;
//     cost?: number;
//     quality?: number;
//   };
// }

// export interface GeneratedContentResponse {
//   data: GeneratedContent[];
//   pagination: PaginationInfo;
// }

// export interface StartPdfProcessingJobRequest {
//   fileId: string;
// }

// export interface StartPdfProcessingJobResponse {
//   jobId: string;
//   status: string;
//   message: string;
//   estimatedProcessingTime: string;
// }

// export interface PdfStatusResponse {
//   jobId: string;
//   status: string;
//   message: string;
//   result?: {
//     extractedText: string;
//     metadata: Record<string, unknown>;
//   };
//   error?: string;
// }

// export interface TranscriptionStartRequest {
//   fileId: string;
// }

// export interface TranscriptionStartResponse {
//   jobId: string;
//   status: string;
//   message: string;
//   transcribeJobName: string;
// }

// export interface TranscriptionStatusResponse {
//   jobId: string;
//   status: string;
//   message: string;
//   result?: {
//     transcript: string;
//     confidence: number;
//     language: string;
//     duration: number;
//   };
//   error?: string;
// }

// export interface EmailConnectionRequest {
//   email: string;
//   password: string;
//   provider: "gmail" | "outlook" | "yahoo" | "imap";
//   serverSettings?: {
//     imapServer?: string;
//     imapPort?: number;
//     smtpServer?: string;
//     smtpPort?: number;
//     useSSL?: boolean;
//   };
// }

// export interface EmailConnectionResponse {
//   message: string;
//   connectionId: string;
//   status: "CONNECTED" | "FAILED";
//   error?: string;
// }

// export interface Creator {
//   id: string;
//   name: string;
//   platform: "youtube" | "tiktok" | "instagram" | "twitter";
//   channelId: string;
//   channelUrl: string;
//   subscriberCount?: number;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
//   metadata?: {
//     description?: string;
//     profileImage?: string;
//     category?: string;
//   };
// }

// export interface CreatorRequest {
//   name: string;
//   platform: "youtube" | "tiktok" | "instagram" | "twitter";
//   channelId: string;
//   channelUrl: string;
// }

// export interface CreatorsResponse {
//   data: Creator[];
// }

// export interface Video {
//   id: string;
//   creatorId: string;
//   title: string;
//   description: string;
//   url: string;
//   thumbnailUrl: string;
//   publishedAt: string;
//   duration: number;
//   viewCount?: number;
//   likeCount?: number;
//   commentCount?: number;
//   metadata?: {
//     tags?: string[];
//     category?: string;
//     language?: string;
//   };
// }

// export interface VideosResponse {
//   data: Video[];
// }

// export interface ContentPattern {
//   id: string;
//   creatorId: string;
//   patternType: "topic" | "style" | "timing" | "format";
//   pattern: string;
//   frequency: number;
//   confidence: number;
//   createdAt: string;
// }

// export interface PatternsResponse {
//   data: ContentPattern[];
// }

// export interface VideoMetrics {
//   videoId: string;
//   views: number;
//   likes: number;
//   comments: number;
//   shares: number;
//   engagementRate: number;
//   watchTime: number;
//   retentionRate: number;
//   collectedAt: string;
// }

// export interface VideoAnalysis {
//   videoId: string;
//   sentiment: "positive" | "negative" | "neutral";
//   topics: string[];
//   keywords: string[];
//   contentSummary: string;
//   trendingScore: number;
//   analyzedAt: string;
// }

// export interface SimilarContentSearchRequest {
//   query: string;
//   limit?: number;
// }

// export interface SimilarContent {
//   id: string;
//   title: string;
//   url: string;
//   similarityScore: number;
//   platform: string;
//   creator: string;
//   publishedAt: string;
// }

// export interface SimilarContentResponse {
//   data: SimilarContent[];
// }

// export interface PineconeHealthResponse {
//   status: "healthy" | "unhealthy";
//   message: string;
//   timestamp: string;
// }

// export interface VectorUpsertRequest {
//   vectors: VectorData[];
//   namespace?: string;
// }

// export interface VectorData {
//   id: string;
//   values: number[];
//   metadata?: Record<string, string | number | boolean | string[]>;
// }

// export interface VectorUpsertResponse {
//   upsertedCount: number;
//   message: string;
// }

// export interface VectorQueryRequest {
//   vector: number[];
//   topK?: number;
//   includeMetadata?: boolean;
//   includeValues?: boolean;
//   filter?: Record<string, string | number | boolean | string[]>;
//   namespace?: string;
// }

// export interface VectorQueryResult {
//   id: string;
//   score: number;
//   values?: number[];
//   metadata?: Record<string, string | number | boolean | string[]>;
// }

// export interface VectorQueryResponse {
//   matches: VectorQueryResult[];
//   namespace: string;
// }

// export interface VectorDeleteRequest {
//   ids: string[];
//   namespace?: string;
// }

// export interface VectorDeleteResponse {
//   deletedCount: number;
//   message: string;
// }

// export interface ContentGenerationPayload {
//   prompt: string;
//   contentType?: string;
//   maxLength?: number;
//   temperature?: number;
//   model?: string;
//   contextType?: "knowledge_base" | "external_url" | "both";
//   externalUrls?: string[];
// }

// export interface ContentGenerationResponse {
//   jobId: string;
//   status: string;
//   message: string;
//   requestId: string;
//   timestamp: string;
// }

// export interface GenerationJob {
//   id: string;
//   prompt: string;
//   contentType: string;
//   status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
//   result?: {
//     content: string;
//     tokens: number;
//     cost: number;
//   };
//   createdAt: string;
//   updatedAt: string;
//   error?: string;
// }

// export interface GenerationJobsResponse {
//   data: GenerationJob[];
//   pagination: PaginationInfo;
// }

// export interface GetContentGenerationResponse {
//   jobId: string;
//   status: string;
//   message: string;
//   result?: {
//     content: string;
//     tokens: number;
//     cost: number;
//   };
//   error?: string;
// }

// export enum HttpStatus {
//   OK = 200,
//   BAD_REQUEST = 400,
//   UNAUTHORIZED = 401,
//   FORBIDDEN = 403,
//   NOT_FOUND = 404,
//   CONFLICT = 409,
//   INTERNAL_SERVER_ERROR = 500,
// }

// export type ProcessingStatus =
//   | "PENDING"
//   | "PROCESSING"
//   | "COMPLETED"
//   | "FAILED";
// export type ContentType = "transcript" | "pdf" | "generated";
// export type Platform = "youtube" | "tiktok" | "instagram" | "twitter";
// export type Sentiment = "positive" | "negative" | "neutral";
// export type PatternType = "topic" | "style" | "timing" | "format";
// export type TransformationType =
//   | "resize"
//   | "convert"
//   | "thumbnail"
//   | "watermark";
// export type EmailProvider = "gmail" | "outlook" | "yahoo" | "imap";
