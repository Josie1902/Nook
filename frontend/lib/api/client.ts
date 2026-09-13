import { ApiError } from "./errors";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function ensureBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  return API_BASE_URL.replace(/\/$/, "");
}

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${ensureBaseUrl()}${normalizedPath}`;
}

async function parseResponseBody<T>(
  response: Response,
): Promise<T | null> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  const trimmed = text.trim();

  if (!trimmed) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  const isJson =
    contentType.includes("application/json") ||
    trimmed.startsWith("{") ||
    trimmed.startsWith("[");

  if (!isJson) {
    return text as T;
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return text as T;
  }
}

function getErrorMessage(errorBody: unknown): string {
  if (!errorBody) {
    return "Request failed";
  }

  if (typeof errorBody === "string") {
    return errorBody;
  }

  if (typeof errorBody !== "object") {
    return "Request failed";
  }

  const body = errorBody as {
    message?: unknown;
  };

  // API returns:
  //
  // {
  //   "code": "DuplicateBookError",
  //   "message": "This book already exists in your library."
  // }
  //
  if (typeof body.message === "string") {
    return body.message;
  }


  return "Request failed";
}


async function request<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  init: RequestInit = {},
): Promise<T> {
  const url = buildApiUrl(path);

  const headers = new Headers(init.headers ?? {});

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  if (
    body !== undefined &&
    !isFormData &&
    method !== "GET"
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    method,
    credentials: "include",
    headers,
    body:
      body !== undefined
        ? isFormData
          ? body
          : JSON.stringify(body)
        : undefined,
  });

  if (!response.ok) {
    const errorBody = await parseResponseBody<unknown>(response);
    const message = getErrorMessage(errorBody);

    // console.error("API request failed", {
    //   method,
    //   url,
    //   status: response.status,
    //   statusText: response.statusText,
    //   body: errorBody,
    // });

    throw new ApiError(
      response.status,
      errorBody,
      message,
    );
  }

  const payload = await parseResponseBody<T>(response);

  return payload as T;
}

export const api = {
  get<T>(
    path: string,
    init?: RequestInit,
  ): Promise<T> {
    return request<T>(
      "GET",
      path,
      undefined,
      init,
    );
  },

  post<T>(
    path: string,
    body?: unknown,
    init?: RequestInit,
  ): Promise<T> {
    return request<T>(
      "POST",
      path,
      body,
      init,
    );
  },

  patch<T>(
    path: string,
    body?: unknown,
    init?: RequestInit,
  ): Promise<T> {
    return request<T>(
      "PATCH",
      path,
      body,
      init,
    );
  },

  delete<T>(
    path: string,
    init?: RequestInit,
  ): Promise<T> {
    return request<T>(
      "DELETE",
      path,
      undefined,
      init,
    );
  },

  postForm<T>(
    path: string,
    formData: FormData,
    init?: RequestInit,
  ): Promise<T> {
    return request<T>(
      "POST",
      path,
      formData,
      init,
    );
  },
};

export { ApiError };