"use client";

import { useState } from "react";

export function useAsset() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkCreateModalOpen, setIsBulkCreateModalOpen] = useState(false);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleOpenBulkCreateModal = () => {
    setIsBulkCreateModalOpen(true);
  };

  const handleBlankAssetCreate = () => {
    console.log("Creating blank asset");
  };

  return {
    isCreateModalOpen,
    isBulkCreateModalOpen,
    handleOpenCreateModal,
    handleOpenBulkCreateModal,
    handleBlankAssetCreate,
  };
}
