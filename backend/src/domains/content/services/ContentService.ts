/**
 * Content domain service for business operations
 */

import { inject, injectable } from "inversify";
import "reflect-metadata";
import { SYMBOLS } from "../../../infrastructure/di/symbols";
import type { Content } from "../entities/Content";
import type { ContentRepository } from "../repositories/ContentRepository";
import type { ContentId, Result, UserId } from "../types";
import { err, ok } from "../types";

export interface ContentPermissions {
	canEdit(content: Content, userId: UserId, userRole: string): boolean;
	canDelete(content: Content, userId: UserId, userRole: string): boolean;
	canPublish(content: Content, userId: UserId, userRole: string): boolean;
}

@injectable()
export class ContentService {
	constructor(
		@inject(SYMBOLS.ContentRepository)
		private readonly repository: ContentRepository,
		@inject(SYMBOLS.ContentPermissions)
		private readonly permissions: ContentPermissions,
	) {}

	/**
	 * Publish content with business rules validation
	 */
	async publishContent(
		contentId: ContentId,
		userId: UserId,
		userRole: string,
	): Promise<Result<Content, Error>> {
		const contentResult = await this.repository.findById(contentId);
		if (!contentResult.ok) {
			return contentResult;
		}

		if (!contentResult.value) {
			return err(new Error("Content not found"));
		}

		const content = contentResult.value;

		// Check permissions
		if (!this.permissions.canPublish(content, userId, userRole)) {
			return err(new Error("Permission denied: cannot publish content"));
		}

		// Attempt to publish
		const publishResult = content.publish();
		if (!publishResult.ok) {
			return publishResult;
		}

		// Save the updated content
		const saveResult = await this.repository.save(publishResult.value);
		if (!saveResult.ok) {
			return err(saveResult.error);
		}

		return ok(publishResult.value);
	}

	/**
	 * Check and enforce featured content limit (max 5)
	 */
	async canAddFeaturedContent(): Promise<Result<boolean, Error>> {
		const countResult = await this.repository.countFeatured();
		if (!countResult.ok) {
			return countResult;
		}

		return ok(countResult.value < 5);
	}

	/**
	 * Get published content with pagination
	 */
	async getPublishedContent(
		page = 1,
		limit = 10,
	): Promise<Result<Content[], Error>> {
		const offset = (page - 1) * limit;

		return await this.repository.findPublished({
			limit,
			offset,
		});
	}

	/**
	 * Get content by author with permission check
	 */
	async getContentByAuthor(
		authorId: UserId,
		requestingUserId: UserId,
		userRole: string,
	): Promise<Result<Content[], Error>> {
		// Authors can see their own content, editors and admins can see all
		if (
			authorId !== requestingUserId &&
			userRole !== "Editor" &&
			userRole !== "Admin"
		) {
			return err(
				new Error("Permission denied: cannot view other users' content"),
			);
		}

		return await this.repository.findByAuthor(authorId);
	}

	/**
	 * Delete content with business rules
	 */
	async deleteContent(
		contentId: ContentId,
		userId: UserId,
		userRole: string,
	): Promise<Result<void, Error>> {
		const contentResult = await this.repository.findById(contentId);
		if (!contentResult.ok) {
			return contentResult;
		}

		if (!contentResult.value) {
			return err(new Error("Content not found"));
		}

		const content = contentResult.value;

		// Check permissions
		if (!this.permissions.canDelete(content, userId, userRole)) {
			return err(new Error("Permission denied: cannot delete content"));
		}

		// Use appropriate deletion method based on content state
		if (content.getState().isPublished()) {
			// Published content can only be soft deleted
			return await this.repository.softDelete(contentId);
		}
		// Non-published content can be hard deleted
		return await this.repository.delete(contentId);
	}

	/**
	 * Update content with permission check
	 */
	async updateContent(
		contentId: ContentId,
		updates: { title?: string; body?: string; excerpt?: string },
		userId: UserId,
		userRole: string,
	): Promise<Result<Content, Error>> {
		const contentResult = await this.repository.findById(contentId);
		if (!contentResult.ok) {
			return contentResult;
		}

		if (!contentResult.value) {
			return err(new Error("Content not found"));
		}

		let content = contentResult.value;

		// Check permissions
		if (!this.permissions.canEdit(content, userId, userRole)) {
			return err(new Error("Permission denied: cannot edit content"));
		}

		// Apply updates
		if (updates.title) {
			const titleResult = content.updateTitle(updates.title);
			if (!titleResult.ok) {
				return titleResult;
			}
			content = titleResult.value;
		}

		if (updates.body) {
			const bodyResult = content.updateBody(updates.body);
			if (!bodyResult.ok) {
				return bodyResult;
			}
			content = bodyResult.value;
		}

		if (updates.excerpt) {
			const excerptResult = content.updateExcerpt(updates.excerpt);
			if (!excerptResult.ok) {
				return excerptResult;
			}
			content = excerptResult.value;
		}

		// Save the updated content
		const saveResult = await this.repository.save(content);
		if (!saveResult.ok) {
			return err(saveResult.error);
		}

		return ok(content);
	}
}
