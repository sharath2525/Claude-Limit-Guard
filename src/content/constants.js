(() => {
	'use strict';

	const CC = (globalThis.ClaudeLimitGuard = globalThis.ClaudeLimitGuard || {});

	CC.DOM = Object.freeze({
		CHAT_MENU_TRIGGER: '[data-testid="chat-menu-trigger"]',
		MODEL_SELECTOR_DROPDOWN: '[data-testid="model-selector-dropdown"]',
		CHAT_PROJECT_WRAPPER: '.chat-project-wrapper'
	});

	CC.CONST = Object.freeze({
		CACHE_WINDOW_MS: 5 * 60 * 1000,
		CONTEXT_LIMIT_TOKENS: 200000,
		REFRESH_DEBOUNCE_MS: 350,
		CONVERSATION_REFRESH_INTERVAL_MS: 30000,
		USAGE_REFRESH_INTERVAL_MS: 60 * 60 * 1000
	});
})();
