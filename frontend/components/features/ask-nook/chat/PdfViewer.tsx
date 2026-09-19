"use client";

import {
  RPProvider,
  RPLayout,
  RPPages,
} from "@react-pdf-kit/viewer";

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  return (
    <RPProvider src={url}>
      <RPLayout toolbar={false}>
        <RPPages />
      </RPLayout>
    </RPProvider>
  );
}

export default PdfViewer;