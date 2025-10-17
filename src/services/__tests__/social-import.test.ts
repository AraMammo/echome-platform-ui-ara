import { socialImportService } from "../social-import";

describe("SocialImportService", () => {
  describe("validateUrl", () => {
    it("should validate YouTube URLs correctly", () => {
      const validUrls = [
        "https://youtube.com/@channelname",
        "https://www.youtube.com/@channelname",
        "https://youtube.com/channel/UC123456789",
        "https://youtube.com/c/channelname",
      ];

      validUrls.forEach((url) => {
        const result = socialImportService.validateUrl("youtube", url);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it("should reject invalid YouTube URLs", () => {
      const invalidUrls = [
        "https://youtube.com/watch?v=123",
        "https://instagram.com/username",
        "https://facebook.com/page",
        "not-a-url",
      ];

      invalidUrls.forEach((url) => {
        const result = socialImportService.validateUrl("youtube", url);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it("should validate Instagram URLs correctly", () => {
      const validUrls = [
        "https://instagram.com/username",
        "https://www.instagram.com/username",
      ];

      validUrls.forEach((url) => {
        const result = socialImportService.validateUrl("instagram", url);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it("should validate Facebook URLs correctly", () => {
      const validUrls = [
        "https://facebook.com/pagename",
        "https://www.facebook.com/pagename",
      ];

      validUrls.forEach((url) => {
        const result = socialImportService.validateUrl("facebook", url);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });
  });

  describe("getPlatformName", () => {
    it("should return correct platform names", () => {
      expect(socialImportService.getPlatformName("youtube")).toBe("YouTube");
      expect(socialImportService.getPlatformName("instagram")).toBe(
        "Instagram"
      );
      expect(socialImportService.getPlatformName("facebook")).toBe("Facebook");
      expect(socialImportService.getPlatformName("unknown")).toBe("unknown");
    });
  });

  describe("getPlatformIcon", () => {
    it("should return correct platform icons", () => {
      expect(socialImportService.getPlatformIcon("youtube")).toBe("🎥");
      expect(socialImportService.getPlatformIcon("instagram")).toBe("📸");
      expect(socialImportService.getPlatformIcon("facebook")).toBe("👥");
      expect(socialImportService.getPlatformIcon("unknown")).toBe("📱");
    });
  });
});
