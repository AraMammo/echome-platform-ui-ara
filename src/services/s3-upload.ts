export class S3UploadServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "S3UploadServiceError";
  }
}

export class S3UploadService {
  async uploadToS3(
    uploadUrl: string,
    file: File,
    onProgress?: (progress: number) => void,
    timeoutMs: number = 600000
  ): Promise<void> {
    try {
      const xhr = new XMLHttpRequest();
      xhr.timeout = timeoutMs;

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(
              new S3UploadServiceError(
                `Failed to upload file to S3: ${xhr.status} ${xhr.statusText}`,
                xhr.status
              )
            );
          }
        });

        xhr.addEventListener("error", () => {
          reject(
            new S3UploadServiceError(
              `Network error: Unable to upload file - ${xhr.statusText}`
            )
          );
        });

        xhr.addEventListener("timeout", () => {
          reject(
            new S3UploadServiceError(
              `Upload timed out after ${timeoutMs / 1000} seconds`
            )
          );
        });

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch (error: unknown) {
      if (error instanceof S3UploadServiceError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new S3UploadServiceError(
          `Network error: Unable to upload file - ${error.message}`
        );
      }

      throw new S3UploadServiceError("Failed to upload file to S3");
    }
  }
}

export const s3UploadService = new S3UploadService();
