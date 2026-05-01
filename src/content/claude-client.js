(() => {
	'use strict';

	const CC = (globalThis.ClaudeLimitGuard = globalThis.ClaudeLimitGuard || {});

	function getLastActiveOrgId() {
		try {
			const row = document.cookie
				.split('; ')
				.find((item) => item.startsWith('lastActiveOrg='));
			return row ? decodeURIComponent(row.split('=').slice(1).join('=')) : null;
		} catch {
			return null;
		}
	}

	async function fetchSameSiteJson(path) {
		const res = await fetch(path, {
			method: 'GET',
			credentials: 'include',
			cache: 'no-store'
		});
		if (!res.ok) throw new Error(`Request failed: ${res.status}`);
		const contentType = res.headers.get('content-type') || '';
		if (!contentType.includes('application/json')) {
			throw new Error('Unexpected response content-type');
		}
		return res.json();
	}

	async function getUsage(orgId) {
		if (!orgId) throw new Error('Missing orgId');
		return fetchSameSiteJson(`/api/organizations/${encodeURIComponent(orgId)}/usage`);
	}

	async function getConversation(orgId, conversationId) {
		if (!orgId || !conversationId) throw new Error('Missing orgId/conversationId');
		const safeOrgId = encodeURIComponent(orgId);
		const safeConversationId = encodeURIComponent(conversationId);
		return fetchSameSiteJson(
			`/api/organizations/${safeOrgId}/chat_conversations/${safeConversationId}` +
				'?tree=true&rendering_mode=messages&render_all_tools=true'
		);
	}

	CC.service = {
		getLastActiveOrgId,
		getUsage,
		getConversation
	};
})();
