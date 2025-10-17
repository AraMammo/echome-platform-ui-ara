"use client";

import React, { useState } from "react";
import { Button } from "@/components/atoms/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Input } from "@/components/atoms/input";
import {
  FileText,
  CheckCircle,
  Share2,
  Eye,
  Heart,
  TrendingUp,
  Search,
  Plus,
  Settings,
  ChevronDown,
} from "lucide-react";

export default function DashboardTemplate() {
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("All Formats");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const contentMetrics = [
    {
      title: "Total Content",
      value: "0",
      icon: FileText,
      color: "text-[#3a8e9c]",
      bgColor: "bg-[#3a8e9c]/10",
    },
    {
      title: "Ready to Post",
      value: "0",
      icon: CheckCircle,
      color: "text-[#9b8baf]",
      bgColor: "bg-[#9b8baf]/10",
    },
    {
      title: "Posted",
      value: "0",
      icon: Share2,
      color: "text-[#b4a398]",
      bgColor: "bg-[#b4a398]/10",
    },
    {
      title: "Total Views",
      value: "135.7K",
      icon: Eye,
      color: "text-[#3a8e9c]",
      bgColor: "bg-[#3a8e9c]/10",
    },
    {
      title: "Engagement",
      value: "10.9K",
      icon: Heart,
      color: "text-[#9b8baf]",
      bgColor: "bg-[#9b8baf]/10",
    },
    {
      title: "Weekly Growth",
      value: "+27%",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  const formatOptions = [
    "All Formats",
    "Blog Posts",
    "Social Media",
    "Videos",
    "Newsletters",
  ];
  const statusOptions = ["All Status", "Draft", "Ready", "Posted", "Archived"];

  return (
    <div className="min-h-screen bg-[#f3f1ec] px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1c1c1e] font-['Satoshi'] mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-[#9b8baf] font-['Satoshi'] mb-1">
            Manage and track your Echosystem in one place.
          </p>
          <p className="text-sm text-[#3a8e9c] font-medium font-['Satoshi']">
            Unmute Yourself.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {contentMetrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white rounded-[20px] p-6 border border-[#d5d2cc] hover:border-[#3a8e9c] transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 ${metric.bgColor} rounded-[12px] flex items-center justify-center`}
                >
                  <metric.icon size={24} className={metric.color} />
                </div>
                {metric.title === "Weekly Growth" && (
                  <div className="text-green-600 text-sm font-medium">+27%</div>
                )}
              </div>
              <div
                className={`text-3xl font-bold ${metric.color} font-['Satoshi'] mb-2`}
              >
                {metric.value}
              </div>
              <p className="text-[#1c1c1e] font-['Satoshi'] font-medium">
                {metric.title}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[20px] p-6 border border-[#d5d2cc] mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9b8baf]"
              />
              <Input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-[#f3f1ec] rounded-[12px] border border-[#d5d2cc] focus:border-[#3a8e9c] outline-none font-['Satoshi'] placeholder:text-[#9b8baf] transition-colors"
              />
            </div>

            <div className="relative">
              <Select value={formatFilter} onValueChange={setFormatFilter}>
                <SelectTrigger className="h-12 px-4 pr-10 bg-[#f3f1ec] rounded-[12px] border border-[#d5d2cc] focus:border-[#3a8e9c] outline-none font-['Satoshi'] text-[#1c1c1e]">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9b8baf] pointer-events-none"
              />
            </div>

            <div className="relative">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 px-4 pr-10 bg-[#f3f1ec] rounded-[12px] border border-[#d5d2cc] focus:border-[#3a8e9c] outline-none font-['Satoshi'] text-[#1c1c1e]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9b8baf] pointer-events-none"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-12 w-12 p-0 rounded-[12px] border-[#d5d2cc] text-[#1c1c1e] hover:bg-[#3a8e9c] hover:text-white hover:border-[#3a8e9c] transition-colors"
            >
              <Settings size={20} />
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-8 border border-[#d5d2cc]">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-[#f3f1ec] rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText size={48} className="text-[#9b8baf]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1c1c1e] font-['Satoshi'] mb-2">
              No content found
            </h3>
            <p className="text-[#9b8baf] font-['Satoshi'] mb-6">
              Start creating content to see it here
            </p>
            <Button className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white font-medium font-['Satoshi'] px-6 py-3 rounded-[12px] transition-colors">
              <Plus size={18} className="mr-2" />
              Create New Content
            </Button>
          </div>
        </div>

        <div className="fixed bottom-6 right-6">
          <div className="w-16 h-16 bg-[#d5d2cc] rounded-full flex items-center justify-center opacity-60">
            <div className="w-8 h-8 bg-[#9b8baf] rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
