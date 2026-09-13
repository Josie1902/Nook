from typing import List
import uuid

from docling_core.transforms.chunker.hybrid_chunker import HybridChunker
from docling_core.types.doc.document import DoclingDocument

from app.application.chunking.ports import PdfChunker
from app.domain.entities.chunk import BoundingBox, Chunk, ChunkProvenance

class DoclingPdfChunker(PdfChunker):

    def __init__(self, tokenizer):
        self._tokenizer = tokenizer

    def chunk(
        self,
        processing_run_id: uuid.UUID,
        doc: DoclingDocument,
    ) -> tuple[List[Chunk], List[ChunkProvenance]]:
    
        chunker = HybridChunker(
            tokenizer=self._tokenizer,
            merge_peers=True,
        )
    
        chunks: list[Chunk] = []
        provenances: list[ChunkProvenance] = []
    
        for index, dl_chunk in enumerate(chunker.chunk(doc)):
            chunk = Chunk(
                processing_run_id=processing_run_id,
                chunk_index=index,
                content=dl_chunk.text,
                page_start=self.page_start(dl_chunk),
                page_end=self.page_end(dl_chunk),
                chapter_title=(
                    dl_chunk.meta.headings[0]
                    if dl_chunk.meta.headings
                    else None
                ),
            )
    
            chunks.append(chunk)

            # Red: https://docling-project.github.io/docling/reference/docling_document/#docling_core.types.doc.BoundingBox
            for page in range(chunk.page_start, chunk.page_end + 1):
                bounding_boxes = tuple(
                    BoundingBox(
                        left=prov.bbox.l,
                        top=prov.bbox.t,
                        right=prov.bbox.r,
                        bottom=prov.bbox.b,
                    )
                    for item in dl_chunk.meta.doc_items
                    for prov in item.prov
                    if prov.page_no == page
                    and prov.bbox is not None
                )
    
                if bounding_boxes:
                    provenances.append(
                        ChunkProvenance(
                            chunk_id=chunk.id,
                            page_number=page,
                            bounding_boxes=bounding_boxes,
                        )
                    )
    
        return chunks, provenances

    def page_start(self, dl_chunk) -> int:
        pages = [
            prov.page_no
            for item in dl_chunk.meta.doc_items
            for prov in item.prov
            if prov.page_no is not None
        ]

        if not pages:
            raise ValueError("Chunk has no page provenance")

        return min(pages)


    def page_end(self, dl_chunk) -> int:
        pages = [
            prov.page_no
            for item in dl_chunk.meta.doc_items
            for prov in item.prov
            if prov.page_no is not None
        ]

        if not pages:
            raise ValueError("Chunk has no page provenance")

        return max(pages)