import { create } from "zustand";

import {
  getBooks as getBooksApi,
  uploadBook as uploadBookApi,
} from "@/lib/api/books";
import { getBookColor } from "@/lib/books";
import type { Book } from "@/types/book";
import { useAppErrorStore } from "./app-error-store";

interface BookState {
  books: Book[];
  currentDropIds: string[];
  loadBooks: () => Promise<Book[]>;
  uploadBook: (file: File) => Promise<Book>;
  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  updateBook: (book: Book) => void;
  removeBook: (id: string) => void;
  clearBooks: () => void;
}

const normalizeBook = (book: Book, index: number): Book => ({
  ...book,
  color: book.color ?? getBookColor(index),
  newlyShelved: book.newlyShelved ?? false,
  readingSessionIds: book.readingSessionIds ?? [],
});

export const useBookStore = create<BookState>()((set) => ({
  books: [],
  currentDropIds: [],

  loadBooks: async () => {
    try {
      const books = await getBooksApi();

      set({
        books: books.map((book, index) => normalizeBook(book, index)),
        currentDropIds: [],
      });

      return books;
    } catch (error) {
      useAppErrorStore.getState().setError(error);
      throw error;
    }
  },

  uploadBook: async (file) => {
    try {
      const book = await uploadBookApi(file);

      set((state) => ({
        books: [
          ...state.books,
          normalizeBook(
            {
              ...book,
              newlyShelved: true,
            },
            state.books.length,
          ),
        ],
        currentDropIds: [...state.currentDropIds, book.id],
      }));

      return book;
    } catch (error) {
      useAppErrorStore.getState().setError(error);
      throw error;
    }
  },

  setBooks: (books) =>
    set({
      books: books.map((book, index) => normalizeBook(book, index)),
      currentDropIds: [],
    }),

  addBook: (book) =>
    set((state) => ({
      books: [...state.books, normalizeBook(book, state.books.length)],
      currentDropIds: [...state.currentDropIds, book.id],
    })),

  updateBook: (book) =>
    set((state) => ({
      books: state.books.map((existingBook) =>
        existingBook.id === book.id
          ? normalizeBook(
              {
                ...existingBook,
                ...book,
              },
              state.books.findIndex(
                (candidate) => candidate.id === book.id,
              ),
            )
          : existingBook,
      ),
    })),

  removeBook: (id) =>
    set((state) => ({
      books: state.books.filter((book) => book.id !== id),
      currentDropIds: state.currentDropIds.filter(
        (bookId) => bookId !== id,
      ),
    })),

  clearBooks: () =>
    set({
      books: [],
      currentDropIds: [],
    }),
}));