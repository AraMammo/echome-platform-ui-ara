"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Slider } from "@/components/atoms/slider";
import { Switch } from "@/components/atoms/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/atoms/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Maximize2, FileImage, ImageIcon, Type, Settings2 } from "lucide-react";
import {
  mediaService,
  MediaServiceError,
  MediaTransformRequest,
} from "@/services";
import { useToast } from "@/components/atoms/toast";

interface TransformMediaRequest {
  fileId: string;
  transformations: {
    resize?: {
      width?: number;
      height?: number;
      maintainAspectRatio?: boolean;
    };
    convert?: {
      format: "jpeg" | "png" | "webp" | "mp4" | "webm";
      quality?: number;
    };
    thumbnail?: {
      width: number;
      height: number;
      format?: "jpeg" | "png" | "webp";
    };
    watermark?: {
      text?: string;
      imageUrl?: string;
      position?:
        | "top-left"
        | "top-right"
        | "bottom-left"
        | "bottom-right"
        | "center";
      opacity?: number;
    };
  };
}

interface MediaSettingsProps {
  fileId?: string;
  onTransform?: (request: TransformMediaRequest) => void;
}

export default function MediaSettings({
  fileId = "",
  onTransform,
}: MediaSettingsProps) {
  const [activeTab, setActiveTab] = useState<
    "resize" | "convert" | "thumbnail" | "watermark"
  >("resize");
  const [isLoading, setIsLoading] = useState(false);
  const { error: showError, success: showSuccess } = useToast();

  const form = useForm<TransformMediaRequest>({
    defaultValues: {
      fileId,
      transformations: {
        resize: {
          width: undefined,
          height: undefined,
          maintainAspectRatio: true,
        },
        convert: {
          format: "jpeg",
          quality: 85,
        },
        thumbnail: {
          width: 300,
          height: 300,
          format: "jpeg",
        },
        watermark: {
          text: "",
          imageUrl: "",
          position: "bottom-right",
          opacity: 0.7,
        },
      },
    },
  });

  const { handleSubmit } = form;

  const onSubmit = async (data: TransformMediaRequest) => {
    if (!data.fileId) {
      showError("Please upload a file first before applying transformations");
      return;
    }

    setIsLoading(true);
    try {
      const transformations: MediaTransformRequest["transformations"] = {};

      if (data.transformations.resize) {
        transformations.resize = {
          width: data.transformations.resize.width,
          height: data.transformations.resize.height,
          maintainAspectRatio: data.transformations.resize.maintainAspectRatio,
        };
      }

      if (data.transformations.convert) {
        transformations.convert = {
          format: data.transformations.convert.format,
          quality: data.transformations.convert.quality,
        };
      }

      if (data.transformations.thumbnail) {
        transformations.thumbnail = {
          width: data.transformations.thumbnail.width,
          height: data.transformations.thumbnail.height,
          format: data.transformations.thumbnail.format,
        };
      }

      if (
        data.transformations.watermark &&
        (data.transformations.watermark.text ||
          data.transformations.watermark.imageUrl)
      ) {
        transformations.watermark = {
          text: data.transformations.watermark.text,
          position: data.transformations.watermark.position,
          opacity: data.transformations.watermark.opacity,
        };
      }

      const apiRequest: MediaTransformRequest = {
        fileId: data.fileId,
        transformations,
      };

      const result = await mediaService.transformMedia(apiRequest);
      console.log("Transform result:", result);

      if (onTransform) {
        onTransform(data);
      }

      showSuccess("Media transformation started successfully!");
    } catch (error) {
      console.error("Transform error:", error);
      if (error instanceof MediaServiceError) {
        showError(`Transform failed: ${error.message}`);
      } else {
        showError("Transform failed: Unknown error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "resize", label: "Resize", icon: Maximize2 },
    { id: "convert", label: "Convert", icon: FileImage },
    { id: "thumbnail", label: "Thumbnail", icon: ImageIcon },
    { id: "watermark", label: "Watermark", icon: Type },
  ] as const;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-2 sm:p-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Media Transform Settings
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Configure transformations for your media files
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div
            className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto [&::-webkit-scrollbar]:hidden"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? "bg-white text-primary shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "resize" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Maximize2 className="w-5 h-5" />
                  Resize Settings
                </CardTitle>
                <CardDescription>
                  Adjust the dimensions of your media file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="transformations.resize.width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width (pixels)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Auto"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Leave empty to maintain aspect ratio
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transformations.resize.height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (pixels)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Auto"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Leave empty to maintain aspect ratio
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="transformations.resize.maintainAspectRatio"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Maintain Aspect Ratio
                        </FormLabel>
                        <FormDescription>
                          Keep the original proportions when resizing
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === "convert" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="w-5 h-5" />
                  Convert Settings
                </CardTitle>
                <CardDescription>
                  Change the format and quality of your media file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="transformations.convert.format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Output Format</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="jpeg">JPEG</SelectItem>
                          <SelectItem value="png">PNG</SelectItem>
                          <SelectItem value="webp">WebP</SelectItem>
                          <SelectItem value="mp4">MP4</SelectItem>
                          <SelectItem value="webm">WebM</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the output format for your media file
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transformations.convert.quality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quality: {field.value}%</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={100}
                          step={1}
                          value={[field.value || 85]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription>
                        Higher values result in better quality but larger file
                        sizes
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === "thumbnail" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Thumbnail Settings
                </CardTitle>
                <CardDescription>
                  Generate a thumbnail version of your media file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="transformations.thumbnail.width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thumbnail Width (pixels)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Width of the generated thumbnail
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transformations.thumbnail.height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thumbnail Height (pixels)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Height of the generated thumbnail
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="transformations.thumbnail.format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail Format</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="jpeg">JPEG</SelectItem>
                          <SelectItem value="png">PNG</SelectItem>
                          <SelectItem value="webp">WebP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Format for the generated thumbnail
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === "watermark" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Watermark Settings
                </CardTitle>
                <CardDescription>
                  Add text or image watermark to your media file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="transformations.watermark.text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Watermark Text</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter watermark text"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Text to display as watermark
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <div className="text-center text-gray-500 text-sm">OR</div>

                  <FormField
                    control={form.control}
                    name="transformations.watermark.imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Watermark Image URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/watermark.png"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          URL of the image to use as watermark
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="transformations.watermark.position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="top-left">Top Left</SelectItem>
                            <SelectItem value="top-right">Top Right</SelectItem>
                            <SelectItem value="bottom-left">
                              Bottom Left
                            </SelectItem>
                            <SelectItem value="bottom-right">
                              Bottom Right
                            </SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Position of the watermark on the media
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transformations.watermark.opacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Opacity: {Math.round((field.value || 0.7) * 100)}%
                        </FormLabel>
                        <FormControl>
                          <Slider
                            min={0.1}
                            max={1}
                            step={0.1}
                            value={[field.value || 0.7]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <FormDescription>
                          Transparency level of the watermark
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-stretch items-center justify-center gap-3">
            <Button
              type="submit"
              className="flex items-center gap-2 w-full sm:w-auto"
              disabled={isLoading}
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isLoading ? "Processing..." : "Apply Transformations"}
              </span>
              <span className="sm:hidden">
                {isLoading ? "Processing..." : "Apply"}
              </span>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
