/**
 * Content permissions implementation based on user roles
 */

import "reflect-metadata";
import { injectable } from "inversify";
import type { Content } from "../entities/Content";
import type { UserId } from "../types";
import type { ContentPermissions } from "./ContentService";

@injectable()
export class DefaultContentPermissions implements ContentPermissions {
	canEdit(content: Content, userId: UserId, userRole: string): boolean {
		// Authors can edit their own content
		if (userRole === "Author" && content.isOwnedBy(userId)) {
			return true;
		}

		// Editors and Admins can edit all content
		if (userRole === "Editor" || userRole === "Admin") {
			return true;
		}

		return false;
	}

	canDelete(content: Content, userId: UserId, userRole: string): boolean {
		// Only Admins can completely delete content
		if (userRole === "Admin") {
			return true;
		}

		// Authors can delete their own non-published content
		if (
			userRole === "Author" &&
			content.isOwnedBy(userId) &&
			!content.getState().isPublished()
		) {
			return true;
		}

		// Editors can delete non-published content
		if (userRole === "Editor" && !content.getState().isPublished()) {
			return true;
		}

		return false;
	}

	canPublish(content: Content, userId: UserId, userRole: string): boolean {
		// Authors can publish their own content
		if (userRole === "Author" && content.isOwnedBy(userId)) {
			return true;
		}

		// Editors and Admins can publish any content
		if (userRole === "Editor" || userRole === "Admin") {
			return true;
		}

		return false;
	}
}
