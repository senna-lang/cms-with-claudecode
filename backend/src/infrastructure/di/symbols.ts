/**
 * Dependency injection symbols for Inversify container
 */

export const SYMBOLS = {
	// Content Domain
	ContentRepository: Symbol.for("ContentRepository"),
	ContentService: Symbol.for("ContentService"),
	ContentPermissions: Symbol.for("ContentPermissions"),

	// Future domains can be added here
	// User Domain
	UserRepository: Symbol.for("UserRepository"),
	UserService: Symbol.for("UserService"),

	// Asset Domain
	AssetRepository: Symbol.for("AssetRepository"),
	AssetService: Symbol.for("AssetService"),

	// Comment Domain
	CommentRepository: Symbol.for("CommentRepository"),
	CommentService: Symbol.for("CommentService"),
} as const;
