/**
 * In-memory Content repository implementation for testing
 */

import "reflect-metadata";
import { injectable } from "inversify";
import type { Content } from "../entities/Content";
import type { ContentId, UserId, Result } from "../types";
import { ok, err } from "../types";
import type {
	ContentRepository,
	ContentSearchCriteria,
} from "./ContentRepository";

@injectable()
export class InMemoryContentRepository implements ContentRepository {
	private contents = new Map<string, Content>();
	private deletedContents = new Set<string>();

	async findById(id: ContentId): Promise<Result<Content | null, Error>> {
		if (this.deletedContents.has(id)) {
			return ok(null);
		}

		const content = this.contents.get(id) || null;
		return ok(content);
	}

	async findByAuthor(authorId: UserId): Promise<Result<Content[], Error>> {
		const contents = Array.from(this.contents.values())
			.filter((content) => !this.deletedContents.has(content.getId()))
			.filter((content) => content.getAuthorId() === authorId);

		return ok(contents);
	}

	async findPublished(
		criteria?: ContentSearchCriteria,
	): Promise<Result<Content[], Error>> {
		let contents = Array.from(this.contents.values())
			.filter((content) => !this.deletedContents.has(content.getId()))
			.filter((content) => content.getState().isPublished());

		if (criteria) {
			if (criteria.authorId) {
				contents = contents.filter(
					(content) => content.getAuthorId() === criteria.authorId,
				);
			}

			if (criteria.publishedAfter) {
				contents = contents.filter((content) => {
					const publishedAt = content.getPublishedAt();
					return publishedAt && publishedAt >= criteria.publishedAfter;
				});
			}

			if (criteria.publishedBefore) {
				contents = contents.filter((content) => {
					const publishedAt = content.getPublishedAt();
					return publishedAt && publishedAt <= criteria.publishedBefore;
				});
			}

			if (criteria.offset) {
				contents = contents.slice(criteria.offset);
			}

			if (criteria.limit) {
				contents = contents.slice(0, criteria.limit);
			}
		}

		return ok(contents);
	}

	async findFeatured(): Promise<Result<Content[], Error>> {
		// For simplicity, featured content is the most recent published content (max 5)
		const publishedResult = await this.findPublished();
		if (!publishedResult.ok) {
			return publishedResult;
		}

		const featured = publishedResult.value
			.sort((a, b) => {
				const aTime = a.getPublishedAt()?.getTime() || 0;
				const bTime = b.getPublishedAt()?.getTime() || 0;
				return bTime - aTime;
			})
			.slice(0, 5);

		return ok(featured);
	}

	async search(
		criteria: ContentSearchCriteria,
	): Promise<Result<Content[], Error>> {
		let contents = Array.from(this.contents.values()).filter(
			(content) => !this.deletedContents.has(content.getId()),
		);

		if (criteria.authorId) {
			contents = contents.filter(
				(content) => content.getAuthorId() === criteria.authorId,
			);
		}

		if (criteria.state) {
			const state = criteria.state;
			contents = contents.filter((content) => content.getState().equals(state));
		}

		if (criteria.publishedAfter) {
			const afterDate = criteria.publishedAfter;
			contents = contents.filter((content) => {
				const publishedAt = content.getPublishedAt();
				return publishedAt && publishedAt >= afterDate;
			});
		}

		if (criteria.publishedBefore) {
			const beforeDate = criteria.publishedBefore;
			contents = contents.filter((content) => {
				const publishedAt = content.getPublishedAt();
				return publishedAt && publishedAt <= beforeDate;
			});
		}

		if (criteria.offset) {
			contents = contents.slice(criteria.offset);
		}

		if (criteria.limit) {
			contents = contents.slice(0, criteria.limit);
		}

		return ok(contents);
	}

	async save(content: Content): Promise<Result<void, Error>> {
		this.contents.set(content.getId(), content);
		return ok(undefined);
	}

	async softDelete(id: ContentId): Promise<Result<void, Error>> {
		const content = this.contents.get(id);

		if (!content) {
			return err(new Error("Content not found"));
		}

		// Only soft delete published content
		if (!content.getState().isPublished()) {
			return err(new Error("Only published content can be soft deleted"));
		}

		this.deletedContents.add(id);
		return ok(undefined);
	}

	async delete(id: ContentId): Promise<Result<void, Error>> {
		const content = this.contents.get(id);

		if (!content) {
			return err(new Error("Content not found"));
		}

		// Only hard delete non-published content
		if (content.getState().isPublished()) {
			return err(new Error("Published content cannot be hard deleted"));
		}

		this.contents.delete(id);
		return ok(undefined);
	}

	async countFeatured(): Promise<Result<number, Error>> {
		const featuredResult = await this.findFeatured();
		if (!featuredResult.ok) {
			return featuredResult;
		}

		return ok(featuredResult.value.length);
	}

	async exists(id: ContentId): Promise<Result<boolean, Error>> {
		const exists = this.contents.has(id) && !this.deletedContents.has(id);
		return ok(exists);
	}

	// Test helper methods
	clear(): void {
		this.contents.clear();
		this.deletedContents.clear();
	}

	getAll(): Content[] {
		return Array.from(this.contents.values()).filter(
			(content) => !this.deletedContents.has(content.getId()),
		);
	}
}
