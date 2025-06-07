/**
 * Content domain exports
 */

// Types
export type { ContentId, UserId, CategoryId, TagId, Result } from "./types";
export { ok, err } from "./types";

// Value Objects
export { ContentState } from "./value-objects/ContentState";
export type { ContentStateType } from "./value-objects/ContentState";

// Entities
export { Content } from "./entities/Content";
export type { ContentProps } from "./entities/Content";

// Repositories
export type {
	ContentRepository,
	ContentSearchCriteria,
} from "./repositories/ContentRepository";
export { InMemoryContentRepository } from "./repositories/InMemoryContentRepository";

// Services
export { ContentService } from "./services/ContentService";
export type { ContentPermissions } from "./services/ContentService";
export { DefaultContentPermissions } from "./services/ContentPermissions";
