/**
 * Content state value object representing the lifecycle state of content
 */

import { type Result, err, ok } from "../types";

export type ContentStateType = "draft" | "published" | "private" | "archived";

export class ContentState {
	private constructor(private readonly state: ContentStateType) {}

	static create(state: ContentStateType): Result<ContentState, Error> {
		const validStates: ContentStateType[] = [
			"draft",
			"published",
			"private",
			"archived",
		];

		if (!validStates.includes(state)) {
			return err(new Error(`Invalid content state: ${state}`));
		}

		return ok(new ContentState(state));
	}

	static draft(): ContentState {
		return new ContentState("draft");
	}

	static published(): ContentState {
		return new ContentState("published");
	}

	static private(): ContentState {
		return new ContentState("private");
	}

	static archived(): ContentState {
		return new ContentState("archived");
	}

	getValue(): ContentStateType {
		return this.state;
	}

	isDraft(): boolean {
		return this.state === "draft";
	}

	isPublished(): boolean {
		return this.state === "published";
	}

	isPrivate(): boolean {
		return this.state === "private";
	}

	isArchived(): boolean {
		return this.state === "archived";
	}

	canTransitionTo(newState: ContentState): boolean {
		const currentState = this.state;
		const targetState = newState.getValue();

		// Business rule: archived content cannot be published again
		if (currentState === "archived" && targetState === "published") {
			return false;
		}

		return true;
	}

	equals(other: ContentState): boolean {
		return this.state === other.state;
	}
}
