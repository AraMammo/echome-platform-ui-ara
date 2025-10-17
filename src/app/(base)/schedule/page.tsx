"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/atoms/button";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import {
  schedulingService,
  Schedule,
  CreateScheduleRequest,
} from "@/services/scheduling";
import {
  databaseContentService,
  GeneratedContent,
} from "@/services/database-content";
import { Calendar } from "@/components/molecules/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduledContent, setScheduledContent] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [availableContent, setAvailableContent] = useState<GeneratedContent[]>(
    []
  );
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [selectedContent, setSelectedContent] =
    useState<GeneratedContent | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    platform: "twitter",
    scheduledTime: "",
    postText: "",
  });

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoading(true);
        const response = await schedulingService.getSchedules({
          limit: 50,
          offset: 0,
        });
        setScheduledContent(response.schedules || []);
      } catch (error) {
        console.error("Error fetching schedules:", error);
        setScheduledContent([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const fetchAvailableContent = async () => {
    try {
      setIsLoadingContent(true);
      const response = await databaseContentService.getGeneratedContent({
        limit: 50,
        offset: 0,
      });
      setAvailableContent(response.content || []);
    } catch (error) {
      console.error("Error fetching available content:", error);
      setAvailableContent([]);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const handleScheduleContent = async () => {
    if (!selectedContent || !scheduleForm.scheduledTime) return;

    try {
      const scheduleRequest: CreateScheduleRequest = {
        contentId: selectedContent.id,
        platform: scheduleForm.platform as "twitter" | "linkedin" | "instagram",
        scheduledTime: new Date(scheduleForm.scheduledTime).toISOString(),
        metadata: {
          title: selectedContent.title,
          contentType: selectedContent.contentType,
        },
      };

      await schedulingService.createSchedule(scheduleRequest);

      const response = await schedulingService.getSchedules({
        limit: 50,
        offset: 0,
      });
      setScheduledContent(response.schedules || []);

      setShowScheduleModal(false);
      setSelectedContent(null);
      setScheduleForm({
        platform: "twitter",
        scheduledTime: "",
        postText: "",
      });
    } catch (error) {
      console.error("Error scheduling content:", error);
    }
  };

  const getSchedulesForDate = (date: Date) => {
    return scheduledContent.filter((schedule) => {
      const scheduleDate = new Date(schedule.scheduledTime);
      return (
        scheduleDate.getDate() === date.getDate() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const platforms = [
    { value: "twitter", label: "Twitter", color: "bg-blue-500" },
    { value: "linkedin", label: "LinkedIn", color: "bg-blue-700" },
    { value: "instagram", label: "Instagram", color: "bg-pink-500" },
  ];

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#1c1c1e] font-['Satoshi'] mb-2">
              Schedule
            </h1>
            <p className="text-lg text-[#9b8baf] font-['Satoshi'] mb-1">
              Plan and schedule your content across platforms.
            </p>
            <p className="text-sm text-[#3a8e9c] font-medium font-['Satoshi']">
              Unmute Yourself.
            </p>
          </div>
          <Button
            onClick={() => {
              fetchAvailableContent();
              setShowScheduleModal(true);
            }}
            className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Schedule Content
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-[20px] p-6 border border-[#d5d2cc]">
            <h3 className="text-lg font-semibold text-[#1c1c1e] font-['Satoshi'] mb-4">
              Calendar View
            </h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="w-full border-0 shadow-none bg-transparent"
              captionLayout="dropdown"
            />

            {selectedDate && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-[#1c1c1e] font-['Satoshi'] mb-3">
                  Scheduled for {selectedDate.toLocaleDateString()}
                </h4>
                <div className="space-y-3">
                  {getSchedulesForDate(selectedDate).length > 0 ? (
                    getSchedulesForDate(selectedDate).map((schedule) => (
                      <div
                        key={schedule.scheduleId}
                        className="p-4 bg-stone-50 rounded-[12px] border border-stone-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  platforms.find(
                                    (p) => p.value === schedule.platform
                                  )?.color || "bg-gray-500"
                                }`}
                              />
                              <span className="text-sm font-medium text-[#1c1c1e] font-['Satoshi']">
                                {platforms.find(
                                  (p) => p.value === schedule.platform
                                )?.label || schedule.platform}
                              </span>
                              <span className="text-xs text-[#9b8baf] font-['Satoshi']">
                                {new Date(
                                  schedule.scheduledTime
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-[#1c1c1e] font-['Satoshi'] mb-1">
                              {schedule.metadata?.title || "Scheduled content"}
                            </p>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-[#9b8baf]" />
                              <span className="text-xs text-[#9b8baf] font-['Satoshi']">
                                {schedule.status === "scheduled"
                                  ? "Scheduled"
                                  : schedule.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {schedule.status === "scheduled" ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : schedule.status === "failed" ? (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-[#9b8baf]" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="mx-auto h-12 w-12 text-[#9b8baf] mb-4" />
                      <p className="text-[#9b8baf] font-['Satoshi']">
                        No content scheduled for this date
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-[20px] p-6 border border-[#d5d2cc]">
              <h3 className="text-lg font-semibold text-[#1c1c1e] font-['Satoshi'] mb-4">
                Upcoming
              </h3>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3a8e9c] mx-auto"></div>
                  </div>
                ) : (
                  scheduledContent
                    .filter(
                      (schedule) =>
                        new Date(schedule.scheduledTime) > new Date()
                    )
                    .slice(0, 5)
                    .map((schedule) => (
                      <div
                        key={schedule.scheduleId}
                        className="p-3 bg-stone-50 rounded-[8px] border border-stone-200"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              platforms.find(
                                (p) => p.value === schedule.platform
                              )?.color || "bg-gray-500"
                            }`}
                          />
                          <span className="text-xs font-medium text-[#1c1c1e] font-['Satoshi']">
                            {platforms.find(
                              (p) => p.value === schedule.platform
                            )?.label || schedule.platform}
                          </span>
                        </div>
                        <p className="text-xs text-[#1c1c1e] font-['Satoshi'] line-clamp-2 mb-1">
                          {schedule.metadata?.title || "Scheduled content"}
                        </p>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-[#9b8baf]" />
                          <span className="text-xs text-[#9b8baf] font-['Satoshi']">
                            {new Date(
                              schedule.scheduledTime
                            ).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(
                              schedule.scheduledTime
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                )}
                {scheduledContent.filter(
                  (schedule) => new Date(schedule.scheduledTime) > new Date()
                ).length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-[#9b8baf] font-['Satoshi'] text-sm">
                      No upcoming schedules
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[20px] p-6 border border-[#d5d2cc]">
              <h3 className="text-lg font-semibold text-[#1c1c1e] font-['Satoshi'] mb-4">
                Platform Distribution
              </h3>
              <div className="space-y-3">
                {platforms.map((platform) => {
                  const count = scheduledContent.filter(
                    (schedule) => schedule.platform === platform.value
                  ).length;
                  return (
                    <div
                      key={platform.value}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${platform.color}`}
                        />
                        <span className="text-sm text-[#1c1c1e] font-['Satoshi']">
                          {platform.label}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-[#1c1c1e] font-['Satoshi']">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {showScheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-[20px] p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#1c1c1e] font-['Satoshi']">
                  Schedule Content
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowScheduleModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#1c1c1e] font-['Satoshi'] mb-2 block">
                    Select Content
                  </label>
                  {isLoadingContent ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3a8e9c] mx-auto"></div>
                    </div>
                  ) : (
                    <Select
                      value={selectedContent?.id || ""}
                      onValueChange={(value) => {
                        const content = availableContent.find(
                          (c) => c.id === value
                        );
                        setSelectedContent(content || null);
                      }}
                    >
                      <SelectTrigger className="w-full border-[#d5d2cc] text-[#1c1c1e] font-['Satoshi']">
                        <SelectValue placeholder="Choose content..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableContent.map((content) => (
                          <SelectItem key={content.id} value={content.id}>
                            {content.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1c1c1e] font-['Satoshi'] mb-2 block">
                    Platform
                  </label>
                  <Select
                    value={scheduleForm.platform}
                    onValueChange={(value) =>
                      setScheduleForm({ ...scheduleForm, platform: value })
                    }
                  >
                    <SelectTrigger className="w-full border-[#d5d2cc] text-[#1c1c1e] font-['Satoshi']">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((platform) => (
                        <SelectItem key={platform.value} value={platform.value}>
                          {platform.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1c1c1e] font-['Satoshi'] mb-2 block">
                    Schedule Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={scheduleForm.scheduledTime}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        scheduledTime: e.target.value,
                      })
                    }
                    className="w-full border-[#d5d2cc] text-[#1c1c1e] font-['Satoshi']"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1c1c1e] font-['Satoshi'] mb-2 block">
                    Post Text
                  </label>
                  <Textarea
                    value={scheduleForm.postText}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        postText: e.target.value,
                      })
                    }
                    placeholder="Add your post text..."
                    rows={3}
                    className="w-full border-[#d5d2cc] text-[#1c1c1e] font-['Satoshi'] resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1 border-[#d5d2cc] text-[#1c1c1e]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleScheduleContent}
                    disabled={!selectedContent || !scheduleForm.scheduledTime}
                    className="flex-1 bg-[#3a8e9c] hover:bg-[#2d7a85] text-white"
                  >
                    Schedule
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
