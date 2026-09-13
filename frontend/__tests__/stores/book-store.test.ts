import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBookStore } from "@/stores/book-store";

const uploadedBook = {
  id: "book-1",
  filename: "sample.pdf",
  mime_type: "application/pdf",
  file_size: 1024,
  title: "Sample Book",
  author: null,
  description: null,
  isbn: null,
  publication_year: null,
  cover_url: null,
  tags: ["demo"],
  processing_status: "pending",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

vi.mock("@/lib/api/books", () => ({
  uploadBook: vi.fn(async () => uploadedBook),
}));

describe("useBookStore", () => {
  beforeEach(() => {
    useBookStore.setState({ books: [], currentDropIds: [] });
    vi.clearAllMocks();
  });

  it("uploads a backend book and stores the returned response", async () => {
    const file = new File(["book"], "sample.pdf", {
      type: "application/pdf",
    });

    const result = await useBookStore.getState().uploadBook(file);

    expect(result).toEqual(uploadedBook);
    expect(useBookStore.getState().books).toHaveLength(1);
    expect(useBookStore.getState().books[0]).toMatchObject({
      id: uploadedBook.id,
      filename: uploadedBook.filename,
      newlyShelved: true,
    });
    expect(useBookStore.getState().currentDropIds).toEqual([uploadedBook.id]);
  });

  it("keeps the current queue separate from previously completed library books", () => {
    useBookStore.setState({
      books: [
        { ...uploadedBook, id: "already-done", processing_status: "completed" },
        { ...uploadedBook, id: "already-done-2", processing_status: "completed" },
      ],
      currentDropIds: [],
    });

    useBookStore.getState().addBook({
      ...uploadedBook,
      id: "new-book-a",
      processing_status: "running",
    });
    useBookStore.getState().addBook({
      ...uploadedBook,
      id: "new-book-b",
      processing_status: "failed",
    });

    expect(useBookStore.getState().currentDropIds).toEqual([
      "new-book-a",
      "new-book-b",
    ]);
    expect(
      useBookStore
        .getState()
        .books.filter((book) =>
          useBookStore.getState().currentDropIds.includes(book.id),
        ),
    ).toHaveLength(2);
  });
});
