/**
 * InMemoryContentRepository tests
 */

import { describe, expect, it, beforeEach } from "vitest";
import { InMemoryContentRepository } from "../InMemoryContentRepository";
import { Content } from "../../entities/Content";
import { ContentState } from "../../value-objects/ContentState";
import type { ContentId, UserId } from "../../types";

describe("InMemoryContentRepository", () => {
	let repository: InMemoryContentRepository;
	const contentId1 = "content-1" as ContentId;
	const contentId2 = "content-2" as ContentId;
	const authorId1 = "user-1" as UserId;
	const authorId2 = "user-2" as UserId;

	beforeEach(() => {
		repository = new InMemoryContentRepository();
	});

	describe("save and findById", () => {
		it("should save and retrieve content", async () => {
			const contentResult = Content.create({
				id: contentId1,
				title: "Test Content",
				body: "This is a test content body that meets the minimum character requirement of 100 characters for content validation.",
				authorId: authorId1,
				state: ContentState.draft(),
			});

			expect(contentResult.ok).toBe(true);
			if (contentResult.ok) {
				const saveResult = await repository.save(contentResult.value);
				expect(saveResult.ok).toBe(true);

				const findResult = await repository.findById(contentId1);
				expect(findResult.ok).toBe(true);
				if (findResult.ok) {
					expect(findResult.value?.getId()).toBe(contentId1);
				}
			}
		});

		it("should return null for non-existent content", async () => {
			const result = await repository.findById("non-existent" as ContentId);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBeNull();
			}
		});
	});

	describe("findByAuthor", () => {
		it("should find content by author", async () => {
			const content1 = Content.create({
				id: contentId1,
				title: "Content 1",
				body: "This is content 1 body that meets the minimum character requirement of 100 characters for content validation rules.",
				authorId: authorId1,
				state: ContentState.draft(),
			});

			const content2 = Content.create({
				id: contentId2,
				title: "Content 2",
				body: "This is content 2 body that meets the minimum character requirement of 100 characters for content validation rules.",
				authorId: authorId2,
				state: ContentState.published(),
			});

			expect(content1.ok && content2.ok).toBe(true);
			if (content1.ok && content2.ok) {
				await repository.save(content1.value);
				await repository.save(content2.value);

				const result = await repository.findByAuthor(authorId1);
				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value).toHaveLength(1);
					expect(result.value[0].getId()).toBe(contentId1);
				}
			}
		});
	});

	describe("findPublished", () => {
		it("should find only published content", async () => {
			const draftContent = Content.create({
				id: contentId1,
				title: "Draft Content",
				body: "This is a draft content body that meets the minimum character requirement of 100 characters for content validation.",
				authorId: authorId1,
				state: ContentState.draft(),
			});

			const publishedContent = Content.create({
				id: contentId2,
				title: "Published Content",
				body: "This is a published content body that meets the minimum character requirement of 100 characters for content validation.",
				authorId: authorId1,
				state: ContentState.published(),
			});

			expect(draftContent.ok && publishedContent.ok).toBe(true);
			if (draftContent.ok && publishedContent.ok) {
				await repository.save(draftContent.value);
				await repository.save(publishedContent.value);

				const result = await repository.findPublished();
				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value).toHaveLength(1);
					expect(result.value[0].getId()).toBe(contentId2);
				}
			}
		});
	});

	describe("softDelete", () => {
		it("should soft delete published content", async () => {
			const publishedContent = Content.create({
				id: contentId1,
				title: "Published Content",
				body: "This is a published content body that meets the minimum character requirement of 100 characters for content validation.",
				authorId: authorId1,
				state: ContentState.published(),
			});

			expect(publishedContent.ok).toBe(true);
			if (publishedContent.ok) {
				await repository.save(publishedContent.value);

				const deleteResult = await repository.softDelete(contentId1);
				expect(deleteResult.ok).toBe(true);

				const findResult = await repository.findById(contentId1);
				expect(findResult.ok).toBe(true);
				if (findResult.ok) {
					expect(findResult.value).toBeNull();
				}
			}
		});

		it("should reject soft delete of non-published content", async () => {
			const draftContent = Content.create({
				id: contentId1,
				title: "Draft Content",
				body: "This is a draft content body that meets the minimum character requirement of 100 characters for content validation.",
				authorId: authorId1,
				state: ContentState.draft(),
			});

			expect(draftContent.ok).toBe(true);
			if (draftContent.ok) {
				await repository.save(draftContent.value);

				const deleteResult = await repository.softDelete(contentId1);
				expect(deleteResult.ok).toBe(false);
			}
		});
	});

	describe("delete", () => {
		it("should hard delete non-published content", async () => {
			const draftContent = Content.create({
				id: contentId1,
				title: "Draft Content",
				body: "This is a draft content body that meets the minimum character requirement of 100 characters for content validation.",
				authorId: authorId1,
				state: ContentState.draft(),
			});

			expect(draftContent.ok).toBe(true);
			if (draftContent.ok) {
				await repository.save(draftContent.value);

				const deleteResult = await repository.delete(contentId1);
				expect(deleteResult.ok).toBe(true);

				const findResult = await repository.findById(contentId1);
				expect(findResult.ok).toBe(true);
				if (findResult.ok) {
					expect(findResult.value).toBeNull();
				}
			}
		});

		it("should reject hard delete of published content", async () => {
			const publishedContent = Content.create({
				id: contentId1,
				title: "Published Content",
				body: "This is a published content body that meets the minimum character requirement of 100 characters for content validation.",
				authorId: authorId1,
				state: ContentState.published(),
			});

			expect(publishedContent.ok).toBe(true);
			if (publishedContent.ok) {
				await repository.save(publishedContent.value);

				const deleteResult = await repository.delete(contentId1);
				expect(deleteResult.ok).toBe(false);
			}
		});
	});
});
