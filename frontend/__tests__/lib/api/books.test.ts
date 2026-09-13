import { beforeEach, describe, expect, it, vi } from "vitest";

const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

describe("books API layer", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000";
  });

  it("uploads a file as multipart form data while preserving auth cookies", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "book-123",
          filename: "demo.pdf",
          mime_type: "application/pdf",
          file_size: 42,
          title: "Demo",
          author: null,
          description: null,
          isbn: null,
          publication_year: null,
          cover_url: null,
          tags: [],
          processing_status: "processing",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const { uploadBook } = await import("@/lib/api/books");
    const file = new File(["hello"], "demo.pdf", { type: "application/pdf" });

    const result = await uploadBook(file);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/books",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: expect.any(FormData),
      }),
    );

    const call = fetchMock.mock.calls[0][1] as RequestInit;
    expect(call.headers).not.toHaveProperty("Content-Type");
    expect(result.id).toBe("book-123");
  });

  it("lists the user library from GET /books", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: "book-1",
            filename: "demo.pdf",
            mime_type: "application/pdf",
            file_size: 42,
            title: "Demo",
            author: null,
            description: null,
            isbn: null,
            publication_year: null,
            cover_url: null,
            tags: [],
            processing_status: "pending",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
        ]),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const { getBooks } = await import("@/lib/api/books");
    const result = await getBooks();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/books",
      expect.objectContaining({
        method: "GET",
        credentials: "include",
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("book-1");
  });

  it("deletes a book through DELETE /books/{book_id}", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const { deleteBook } = await import("@/lib/api/books");
    await deleteBook("book-456");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/books/book-456",
      expect.objectContaining({
        method: "DELETE",
        credentials: "include",
      }),
    );
  });

  it("throws an ApiError with backend status and body on non-2xx responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ detail: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const { getBookProcessing } = await import("@/lib/api/books");

    await expect(getBookProcessing("book-123")).rejects.toMatchObject({
      status: 401,
      message: "Unauthorized",
    });
  });
});

process.env.NEXT_PUBLIC_API_URL = originalApiUrl ?? "";
