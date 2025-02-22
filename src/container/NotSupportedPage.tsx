"use client";

import NotSupportedComponent from "@/components/Error/NotSupported";
import { useTranslation } from "@/contexts/TranslationContext";
import React from "react";

const NotSupportedPage = () => {
  const {
    isTranslationSupported,
    isDetectionSupported,
    isSummarizationSupported
  } = useTranslation();

  return (
    <div>
      <NotSupportedComponent
        isTranslationSupported={isTranslationSupported}
        isDetectionSupported={isDetectionSupported}
        isSummarizationSupported={isSummarizationSupported}
      />
    </div>
  );
};

export default NotSupportedPage;
