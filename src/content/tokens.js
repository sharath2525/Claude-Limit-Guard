(() => {
	'use strict';

	const CC = (globalThis.ClaudeLimitGuard = globalThis.ClaudeLimitGuard || {});
	const ROOT_MESSAGE_ID = '00000000-0000-4000-8000-000000000000';

	function estimateTokens(text) {
		if (!text) return 0;
		const normalized = String(text).replace(/\s+/g, ' ').trim();
		if (!normalized) return 0;

		const latinWords = normalized.match(/[A-Za-z0-9]+(?:[._'-][A-Za-z0-9]+)*/g) || [];
		const cjkChars = normalized.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/g) || [];
		const symbols = normalized.match(/[^\s\p{L}\p{N}]/gu) || [];
		const otherLetters = normalized.match(/[^\x00-\x7F\s\p{P}\p{S}]/gu) || [];

		return Math.max(1, Math.ceil(
			latinWords.length * 1.35 +
			cjkChars.length * 1.1 +
			symbols.length * 0.7 +
			otherLetters.length * 0.9
		));
	}

	function stableText(value) {
		if (value === null || value === undefined) return '';
		if (typeof value === 'string') return value;
		if (typeof value !== 'object') return String(value);
		try {
			return JSON.stringify(value);
		} catch {
			return '';
		}
	}

	function contentItemText(item) {
		if (!item || typeof item !== 'object') return '';
		if (item.type === 'thinking' || item.type === 'redacted_thinking') return '';
		if (item.type === 'image' || item.type === 'document') return '';
		if (typeof item.text === 'string') return item.text;
		if (typeof item.content === 'string') return item.content;
		if (Array.isArray(item.content)) return item.content.map(stableText).join('\n');
		if (item.type === 'tool_use') return stableText({ name: item.name, input: item.input });
		if (item.type === 'tool_result') return stableText({ is_error: item.is_error, content: item.content });
		return '';
	}

	function messageText(message) {
		const parts = [];
		const content = Array.isArray(message?.content) ? message.content : [];
		for (const item of content) {
			const text = contentItemText(item);
			if (text) parts.push(text);
		}

		const attachments = Array.isArray(message?.attachments) ? message.attachments : [];
		for (const attachment of attachments) {
			if (typeof attachment?.extracted_content === 'string') {
				parts.push(attachment.extracted_content);
			}
		}

		return parts.join('\n');
	}

	function buildVisibleBranch(conversation) {
		const messages = Array.isArray(conversation?.chat_messages) ? conversation.chat_messages : [];
		const byId = new Map();
		for (const message of messages) {
			if (message?.uuid) byId.set(message.uuid, message);
		}

		const trunk = [];
		let currentId = conversation?.current_leaf_message_uuid;
		while (currentId && currentId !== ROOT_MESSAGE_ID) {
			const message = byId.get(currentId);
			if (!message) break;
			trunk.push(message);
			currentId = message.parent_message_uuid;
		}

		return trunk.reverse();
	}

	function computeConversationMetrics(conversation) {
		const trunk = buildVisibleBranch(conversation);
		let totalTokens = 0;
		let lastAssistantMs = null;

		for (const message of trunk) {
			totalTokens += estimateTokens(messageText(message));
			if (message?.sender === 'assistant' && message?.created_at) {
				const createdMs = Date.parse(message.created_at);
				if (Number.isFinite(createdMs) && (!lastAssistantMs || createdMs > lastAssistantMs)) {
					lastAssistantMs = createdMs;
				}
			}
		}

		return {
			totalTokens,
			messageCount: trunk.length,
			cachedUntil: lastAssistantMs ? lastAssistantMs + CC.CONST.CACHE_WINDOW_MS : null
		};
	}

	CC.tokens = {
		computeConversationMetrics
	};
})();
