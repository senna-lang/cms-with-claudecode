/**
 * Content entity representing a piece of content in the CMS
 */

import { ContentState } from "../value-objects/ContentState";
import type { ContentId, UserId, Result } from "../types";
import { err, ok } from "../types";

export interface ContentProps {
	id: ContentId;
	title: string;
	body: string;
	authorId: UserId;
	state: ContentState;
	excerpt?: string;
	publishedAt?: Date;
	updatedAt?: Date;
}

export class Content {
	private constructor(
		private readonly id: ContentId,
		private title: string,
		private body: string,
		private readonly authorId: UserId,
		private state: ContentState,
		private excerpt: string,
		private publishedAt?: Date,
		private updatedAt?: Date,
	) {}

	static create(props: ContentProps): Result<Content, Error> {
		// Validate title length (5-100 characters)
		if (props.title.length < 5 || props.title.length > 100) {
			return err(new Error("Title must be between 5 and 100 characters"));
		}

		// Validate body length (minimum 100 characters)
		if (props.body.length < 100) {
			return err(new Error("Body must be at least 100 characters"));
		}

		// Auto-generate excerpt if not provided
		const excerpt = props.excerpt || props.body.substring(0, 150);

		const now = new Date();

		return ok(
			new Content(
				props.id,
				props.title,
				props.body,
				props.authorId,
				props.state,
				excerpt,
				props.publishedAt,
				props.updatedAt || now,
			),
		);
	}

	getId(): ContentId {
		return this.id;
	}

	getTitle(): string {
		return this.title;
	}

	getBody(): string {
		return this.body;
	}

	getAuthorId(): UserId {
		return this.authorId;
	}

	getState(): ContentState {
		return this.state;
	}

	getExcerpt(): string {
		return this.excerpt;
	}

	getPublishedAt(): Date | undefined {
		return this.publishedAt;
	}

	getUpdatedAt(): Date | undefined {
		return this.updatedAt;
	}

	updateTitle(newTitle: string): Result<Content, Error> {
		if (newTitle.length < 5 || newTitle.length > 100) {
			return err(new Error("Title must be between 5 and 100 characters"));
		}

		return ok(
			new Content(
				this.id,
				newTitle,
				this.body,
				this.authorId,
				this.state,
				this.excerpt,
				this.publishedAt,
				new Date(),
			),
		);
	}

	updateBody(newBody: string): Result<Content, Error> {
		if (newBody.length < 100) {
			return err(new Error("Body must be at least 100 characters"));
		}

		// Update excerpt if it was auto-generated
		const newExcerpt =
			this.excerpt === this.body.substring(0, 150)
				? newBody.substring(0, 150)
				: this.excerpt;

		return ok(
			new Content(
				this.id,
				this.title,
				newBody,
				this.authorId,
				this.state,
				newExcerpt,
				this.publishedAt,
				new Date(),
			),
		);
	}

	updateExcerpt(newExcerpt: string): Result<Content, Error> {
		return ok(
			new Content(
				this.id,
				this.title,
				this.body,
				this.authorId,
				this.state,
				newExcerpt,
				this.publishedAt,
				new Date(),
			),
		);
	}

	changeState(newState: ContentState): Result<Content, Error> {
		if (!this.state.canTransitionTo(newState)) {
			return err(
				new Error(
					`Cannot transition from ${this.state.getValue()} to ${newState.getValue()}`,
				),
			);
		}

		const publishedAt =
			newState.isPublished() && !this.publishedAt
				? new Date()
				: this.publishedAt;

		return ok(
			new Content(
				this.id,
				this.title,
				this.body,
				this.authorId,
				newState,
				this.excerpt,
				publishedAt,
				new Date(),
			),
		);
	}

	publish(): Result<Content, Error> {
		return this.changeState(ContentState.published());
	}

	unpublish(): Result<Content, Error> {
		return this.changeState(ContentState.private());
	}

	archive(): Result<Content, Error> {
		return this.changeState(ContentState.archived());
	}

	isOwnedBy(userId: UserId): boolean {
		return this.authorId === userId;
	}
}
