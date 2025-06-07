/**
 * ContentState value object tests
 */

import { describe, expect, it } from "vitest";
import { ContentState } from "../ContentState";

describe("ContentState", () => {
	describe("create", () => {
		it("should create valid content states", () => {
			const draftResult = ContentState.create("draft");
			expect(draftResult.ok).toBe(true);
			if (draftResult.ok) {
				expect(draftResult.value.getValue()).toBe("draft");
			}

			const publishedResult = ContentState.create("published");
			expect(publishedResult.ok).toBe(true);
			if (publishedResult.ok) {
				expect(publishedResult.value.getValue()).toBe("published");
			}
		});

		it("should reject invalid content states", () => {
			// biome-ignore lint/suspicious/noExplicitAny: Testing invalid input
			const result = ContentState.create("invalid" as any);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.message).toContain("Invalid content state");
			}
		});
	});

	describe("factory methods", () => {
		it("should create draft state", () => {
			const state = ContentState.draft();
			expect(state.getValue()).toBe("draft");
			expect(state.isDraft()).toBe(true);
		});

		it("should create published state", () => {
			const state = ContentState.published();
			expect(state.getValue()).toBe("published");
			expect(state.isPublished()).toBe(true);
		});

		it("should create private state", () => {
			const state = ContentState.private();
			expect(state.getValue()).toBe("private");
			expect(state.isPrivate()).toBe(true);
		});

		it("should create archived state", () => {
			const state = ContentState.archived();
			expect(state.getValue()).toBe("archived");
			expect(state.isArchived()).toBe(true);
		});
	});

	describe("state transition rules", () => {
		it("should allow normal state transitions", () => {
			const draft = ContentState.draft();
			const published = ContentState.published();
			const private_ = ContentState.private();

			expect(draft.canTransitionTo(published)).toBe(true);
			expect(draft.canTransitionTo(private_)).toBe(true);
			expect(published.canTransitionTo(private_)).toBe(true);
		});

		it("should prevent archived content from being published", () => {
			const archived = ContentState.archived();
			const published = ContentState.published();

			expect(archived.canTransitionTo(published)).toBe(false);
		});

		it("should allow archived content to transition to other states", () => {
			const archived = ContentState.archived();
			const draft = ContentState.draft();
			const private_ = ContentState.private();

			expect(archived.canTransitionTo(draft)).toBe(true);
			expect(archived.canTransitionTo(private_)).toBe(true);
		});
	});

	describe("equals", () => {
		it("should return true for same states", () => {
			const state1 = ContentState.draft();
			const state2 = ContentState.draft();

			expect(state1.equals(state2)).toBe(true);
		});

		it("should return false for different states", () => {
			const draft = ContentState.draft();
			const published = ContentState.published();

			expect(draft.equals(published)).toBe(false);
		});
	});
});
