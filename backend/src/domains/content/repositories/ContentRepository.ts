/**
 * Content repository interface for data persistence
 */

import type { Content } from "../entities/Content";
import type { ContentId, UserId, Result } from "../types";
import type { ContentState } from "../value-objects/ContentState";

export interface ContentSearchCriteria {
	authorId?: UserId;
	state?: ContentState;
	featured?: boolean;
	publishedAfter?: Date;
	publishedBefore?: Date;
	limit?: number;
	offset?: number;
}

export interface ContentRepository {
	/**
	 * Find content by ID
	 */
	findById(id: ContentId): Promise<Result<Content | null, Error>>;

	/**
	 * Find content by author
	 */
	findByAuthor(authorId: UserId): Promise<Result<Content[], Error>>;

	/**
	 * Find published content
	 */
	findPublished(
		criteria?: ContentSearchCriteria,
	): Promise<Result<Content[], Error>>;

	/**
	 * Find featured content (max 5)
	 */
	findFeatured(): Promise<Result<Content[], Error>>;

	/**
	 * Search content with criteria
	 */
	search(criteria: ContentSearchCriteria): Promise<Result<Content[], Error>>;

	/**
	 * Save content (create or update)
	 */
	save(content: Content): Promise<Result<void, Error>>;

	/**
	 * Soft delete content (logical deletion only for published content)
	 */
	softDelete(id: ContentId): Promise<Result<void, Error>>;

	/**
	 * Hard delete content (only for non-published content)
	 */
	delete(id: ContentId): Promise<Result<void, Error>>;

	/**
	 * Count featured content
	 */
	countFeatured(): Promise<Result<number, Error>>;

	/**
	 * Check if content exists
	 */
	exists(id: ContentId): Promise<Result<boolean, Error>>;
}
