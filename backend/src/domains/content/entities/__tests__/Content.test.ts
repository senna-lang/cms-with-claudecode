/**
 * Content entity tests
 */

import { describe, expect, it } from "vitest";
import { Content } from "../Content";
import { ContentState } from "../../value-objects/ContentState";
import type { ContentId, UserId } from "../../types";

describe("Content", () => {
	const contentId = "content-123" as ContentId;
	const authorId = "user-456" as UserId;
	const validTitle = "Valid Content Title";
	const validBody =
		"This is a valid content body that meets the minimum character requirement of 100 characters. It contains enough content to be considered valid according to business rules.";

	describe("create", () => {
		it("should create valid content", () => {
			const result = Content.create({
				id: contentId,
				title: validTitle,
				body: validBody,
				authorId,
				state: ContentState.draft(),
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.getId()).toBe(contentId);
				expect(result.value.getTitle()).toBe(validTitle);
				expect(result.value.getBody()).toBe(validBody);
				expect(result.value.getAuthorId()).toBe(authorId);
				expect(result.value.getState().isDraft()).toBe(true);
			}
		});

		it("should reject content with invalid title length", () => {
			const shortTitle = "Hi";
			const result = Content.create({
				id: contentId,
				title: shortTitle,
				body: validBody,
				authorId,
				state: ContentState.draft(),
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.message).toContain(
					"Title must be between 5 and 100 characters",
				);
			}
		});

		it("should reject content with invalid body length", () => {
			const shortBody = "Short body";
			const result = Content.create({
				id: contentId,
				title: validTitle,
				body: shortBody,
				authorId,
				state: ContentState.draft(),
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.message).toContain(
					"Body must be at least 100 characters",
				);
			}
		});

		it("should auto-generate excerpt from body when not provided", () => {
			const result = Content.create({
				id: contentId,
				title: validTitle,
				body: validBody,
				authorId,
				state: ContentState.draft(),
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				const excerpt = result.value.getExcerpt();
				expect(excerpt).toBe(validBody.substring(0, 150));
			}
		});

		it("should use provided excerpt when given", () => {
			const customExcerpt = "Custom excerpt for this content";
			const result = Content.create({
				id: contentId,
				title: validTitle,
				body: validBody,
				authorId,
				state: ContentState.draft(),
				excerpt: customExcerpt,
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.getExcerpt()).toBe(customExcerpt);
			}
		});
	});

	describe("updateTitle", () => {
		it("should update title with valid value", () => {
			const content = Content.create({
				id: contentId,
				title: validTitle,
				body: validBody,
				authorId,
				state: ContentState.draft(),
			});

			expect(content.ok).toBe(true);
			if (content.ok) {
				const newTitle = "Updated Title";
				const result = content.value.updateTitle(newTitle);

				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.getTitle()).toBe(newTitle);
				}
			}
		});

		it("should reject invalid title", () => {
			const content = Content.create({
				id: contentId,
				title: validTitle,
				body: validBody,
				authorId,
				state: ContentState.draft(),
			});

			expect(content.ok).toBe(true);
			if (content.ok) {
				const invalidTitle = "Hi";
				const result = content.value.updateTitle(invalidTitle);

				expect(result.ok).toBe(false);
			}
		});
	});

	describe("changeState", () => {
		it("should change state when transition is allowed", () => {
			const content = Content.create({
				id: contentId,
				title: validTitle,
				body: validBody,
				authorId,
				state: ContentState.draft(),
			});

			expect(content.ok).toBe(true);
			if (content.ok) {
				const result = content.value.changeState(ContentState.published());

				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.getState().isPublished()).toBe(true);
				}
			}
		});

		it("should reject invalid state transition", () => {
			const content = Content.create({
				id: contentId,
				title: validTitle,
				body: validBody,
				authorId,
				state: ContentState.archived(),
			});

			expect(content.ok).toBe(true);
			if (content.ok) {
				const result = content.value.changeState(ContentState.published());

				expect(result.ok).toBe(false);
				if (!result.ok) {
					expect(result.error.message).toContain("Cannot transition");
				}
			}
		});
	});
});
