from typing import Optional

import httpx

from app.application.metadata_extraction.ports import (
    MetadataProvider,
    MetadataResult,
)


class GoogleBooksMetadataProvider(MetadataProvider):
    BASE_URL = "https://www.googleapis.com/books/v1/volumes"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self._client = httpx.Client(timeout=15)

    def search_by_isbn(self, isbn: str) -> MetadataResult:
        return self._search(f"isbn:{isbn}")

    def search_by_title_author(
        self,
        title: Optional[str],
        author: Optional[str],
    ) -> MetadataResult:
        parts = []

        if title:
            parts.append(f"intitle:{title}")

        if author:
            parts.append(f"inauthor:{author}")

        if not parts:
            return MetadataResult()

        return self._search("+".join(parts))

    def _search(self, query: str) -> MetadataResult:
        params = {"q": query}

        if self.api_key:
            params["key"] = self.api_key

        response = self._client.get(
            self.BASE_URL,
            params=params,
        )
        response.raise_for_status()

        items = response.json().get("items", [])

        if not items:
            return MetadataResult()

        volume_info = items[0].get("volumeInfo", {})

        return self._to_metadata_result(volume_info)

    def _to_metadata_result(self, volume_info: dict) -> MetadataResult:
        identifiers = volume_info.get("industryIdentifiers", [])

        isbn = next(
            (
                identifier["identifier"]
                for identifier in identifiers
                if identifier.get("type") in ("ISBN_13", "ISBN_10")
            ),
            None,
        )

        published_date = volume_info.get("publishedDate", "")
        publication_year = (
            int(published_date[:4])
            if published_date[:4].isdigit()
            else None
        )

        return MetadataResult(
            title=volume_info.get("title"),
            author=", ".join(volume_info.get("authors", [])) or None,
            description=volume_info.get("description"),
            isbn=isbn,
            publication_year=publication_year,
            cover_url=volume_info.get("imageLinks", {}).get("thumbnail"),
            tags=volume_info.get("categories", []),
        )

    def close(self) -> None:
        self._client.close()