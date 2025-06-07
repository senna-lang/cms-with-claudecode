/**
 * Inversify container configuration for dependency injection
 */

import "reflect-metadata";
import { Container } from "inversify";
import { SYMBOLS } from "./symbols";

// Content Domain
import type { ContentRepository } from "../../domains/content/repositories/ContentRepository";
import { InMemoryContentRepository } from "../../domains/content/repositories/InMemoryContentRepository";
import { ContentService } from "../../domains/content/services/ContentService";
import type { ContentPermissions } from "../../domains/content/services/ContentService";
import { DefaultContentPermissions } from "../../domains/content/services/ContentPermissions";

export function createContainer(): Container {
	const container = new Container();

	// Content Domain Bindings
	container
		.bind<ContentRepository>(SYMBOLS.ContentRepository)
		.to(InMemoryContentRepository)
		.inSingletonScope();
	container
		.bind<ContentPermissions>(SYMBOLS.ContentPermissions)
		.to(DefaultContentPermissions)
		.inSingletonScope();
	container
		.bind<ContentService>(SYMBOLS.ContentService)
		.to(ContentService)
		.inTransientScope();

	return container;
}

// Global container instance
export const container = createContainer();
