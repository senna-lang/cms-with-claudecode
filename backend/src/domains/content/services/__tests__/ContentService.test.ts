/**
 * ContentService tests
 */

import { describe, expect, it, beforeEach } from "vitest";
import { ContentService } from "../ContentService";
import { DefaultContentPermissions } from "../ContentPermissions";
import { InMemoryContentRepository } from "../../repositories/InMemoryContentRepository";
import { Content } from "../../entities/Content";
import { ContentState } from "../../value-objects/ContentState";
import type { ContentId, UserId } from "../../types";

describe("ContentService", () => {
	let service: ContentService;
	let repository: InMemoryContentRepository;
	let permissions: DefaultContentPermissions;

	const authorId = "user-1" as UserId;
	const editorId = "user-2" as UserId;
	const adminId = "user-3" as UserId;
	const contentId = "content-1" as ContentId;

	beforeEach(() => {
		repository = new InMemoryContentRepository();
		permissions = new DefaultContentPermissions();
		service = new ContentService(repository, permissions);
	});

	describe("publishContent", () => {
		it("should allow author to publish their own content", async () => {
			const content = Content.create({
				id: contentId,
				title: "Test Content",
				body: "This is a test content body that meets the minimum character requirement of 100 characters for content validation.",
				authorId,
				state: ContentState.draft(),
			});

			expect(content.ok).toBe(true);
			if (content.ok) {
				await repository.save(content.value);

				const result = await service.publishContent(
					contentId,
					authorId,
					"Author",
				);
				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.getState().isPublished()).toBe(true);
				}
			}
		});

		it("should allow editor to publish any content", async () => {
			const content = Content.create({
				id: contentId,
				title: "Test Content",
				body: "This is a test content body that meets the minimum character requirement of 100 characters for content validation.",
				authorId,
				state: ContentState.draft(),
			});

			expect(content.ok).toBe(true);
			if (content.ok) {
				await repository.save(content.value);

				const result = await service.publishContent(
					contentId,
					editorId,
					"Editor",
				);
				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.getState().isPublished()).toBe(true);
				}
			}
		});

		it("should reject unauthorized user", async () => {
			const content = Content.create({
				id: contentId,
				title: "Test Content",
				body: "This is a test content body that meets the minimum character requirement of 100 characters for content validation.",
				authorId,
				state: ContentState.draft(),
			});

			expect(content.ok).toBe(true);
			if (content.ok) {
				await repository.save(content.value);

				const unauthorizedUserId = "user-999" as UserId;
				const result = await service.publishContent(
					contentId,
					unauthorizedUserId,
					"Author",
				);
				expect(result.ok).toBe(false);
				if (!result.ok) {
					expect(result.error.message).toContain("Permission denied");
				}
			}
		});
	});

	describe("canAddFeaturedContent", () => {
		it("should return true when less than 5 featured content", async () => {
			const result = await service.canAddFeaturedContent();
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(true);
			}
		});
	});

	describe("deleteContent", () => {
		it("should hard delete non-published content for author", async () => {
			const content = Content.create({
				id: contentId,
				title: "Test Content",
				body: "This is a test content body that meets the minimum character requirement of 100 characters for content validation.",
				authorId,
				state: ContentState.draft(),
			});

			expect(content.ok).toBe(true);
			if (content.ok) {
				await repository.save(content.value);

				const result = await service.deleteContent(
					contentId,
					authorId,
					"Author",
				);
				expect(result.ok).toBe(true);

				const findResult = await repository.findById(contentId);
				expect(findResult.ok).toBe(true);
				if (findResult.ok) {
					expect(findResult.value).toBeNull();
				}
			}
		});

		it("should soft delete published content for admin", async () => {
			const content = Content.create({
				id: contentId,
				title: "Test Content",
				body: "This is a test content body that meets the minimum character requirement of 100 characters for content validation.",
				authorId,
				state: ContentState.published(),
			});

			expect(content.ok).toBe(true);
			if (content.ok) {
				await repository.save(content.value);

				const result = await service.deleteContent(contentId, adminId, "Admin");
				expect(result.ok).toBe(true);

				const findResult = await repository.findById(contentId);
				expect(findResult.ok).toBe(true);
				if (findResult.ok) {
					expect(findResult.value).toBeNull(); // Soft deleted
				}
			}
		});
	});

	describe("updateContent", () => {
		it("should allow author to update their own content", async () => {
			const content = Content.create({
				id: contentId,
				title: "Original Title",
				body: "This is the original content body that meets the minimum character requirement of 100 characters for content validation.",
				authorId,
				state: ContentState.draft(),
			});

			expect(content.ok).toBe(true);
			if (content.ok) {
				await repository.save(content.value);

				const result = await service.updateContent(
					contentId,
					{ title: "Updated Title" },
					authorId,
					"Author",
				);

				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.getTitle()).toBe("Updated Title");
				}
			}
		});

		it("should reject unauthorized user", async () => {
			const content = Content.create({
				id: contentId,
				title: "Original Title",
				body: "This is the original content body that meets the minimum character requirement of 100 characters for content validation.",
				authorId,
				state: ContentState.draft(),
			});

			expect(content.ok).toBe(true);
			if (content.ok) {
				await repository.save(content.value);

				const unauthorizedUserId = "user-999" as UserId;
				const result = await service.updateContent(
					contentId,
					{ title: "Updated Title" },
					unauthorizedUserId,
					"Author",
				);

				expect(result.ok).toBe(false);
				if (!result.ok) {
					expect(result.error.message).toContain("Permission denied");
				}
			}
		});
	});
});
