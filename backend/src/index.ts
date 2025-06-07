import "reflect-metadata";
import { Hono } from "hono";
import { container, SYMBOLS } from "./infrastructure/di";
import type { ContentService } from "./domains/content/services/ContentService";

const app = new Hono();

// Get services from DI container
const contentService = container.get<ContentService>(SYMBOLS.ContentService);

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.get("/health", (c) => {
	return c.json({
		status: "ok",
		services: {
			contentService: !!contentService,
		},
	});
});

export default app;
