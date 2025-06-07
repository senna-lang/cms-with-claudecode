/**
 * DI Container tests
 */

import "reflect-metadata";
import { describe, expect, it } from "vitest";
import { createContainer, SYMBOLS } from "../index";
import type { ContentService } from "../../../domains/content/services/ContentService";
import type { ContentRepository } from "../../../domains/content/repositories/ContentRepository";
import type { ContentPermissions } from "../../../domains/content/services/ContentService";

describe("DI Container", () => {
	it("should create container and resolve dependencies", () => {
		const container = createContainer();

		// Test that we can resolve all content domain dependencies
		const contentRepository = container.get<ContentRepository>(
			SYMBOLS.ContentRepository,
		);
		expect(contentRepository).toBeDefined();

		const contentPermissions = container.get<ContentPermissions>(
			SYMBOLS.ContentPermissions,
		);
		expect(contentPermissions).toBeDefined();

		const contentService = container.get<ContentService>(
			SYMBOLS.ContentService,
		);
		expect(contentService).toBeDefined();
	});

	it("should maintain singleton scope for repository", () => {
		const container = createContainer();

		const repo1 = container.get<ContentRepository>(SYMBOLS.ContentRepository);
		const repo2 = container.get<ContentRepository>(SYMBOLS.ContentRepository);

		expect(repo1).toBe(repo2); // Same instance
	});

	it("should create new instances for transient services", () => {
		const container = createContainer();

		const service1 = container.get<ContentService>(SYMBOLS.ContentService);
		const service2 = container.get<ContentService>(SYMBOLS.ContentService);

		expect(service1).not.toBe(service2); // Different instances
	});
});
