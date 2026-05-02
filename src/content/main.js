(() => {
	'use strict';

	const CC = (globalThis.ClaudeLimitGuard = globalThis.ClaudeLimitGuard || {});
	if (CC.__started) return;
	CC.__started = true;

	function waitForElement(selector, timeoutMs) {
		return new Promise((resolve) => {
			const existing = document.querySelector(selector);
			if (existing) {
				resolve(existing);
				return;
			}

			let timeoutId;
			const observer = new MutationObserver(() => {
				const el = document.querySelector(selector);
				if (!el) return;
				if (timeoutId) clearTimeout(timeoutId);
				observer.disconnect();
				resolve(el);
			});

			observer.observe(document.body, { childList: true, subtree: true });
			if (timeoutMs) {
				timeoutId = setTimeout(() => {
					observer.disconnect();
					resolve(null);
				}, timeoutMs);
			}
		});
	}

	CC.waitForElement = waitForElement;

	function observeUrlChanges(callback) {
		let lastPath = window.location.pathname;
		const fireIfChanged = () => {
			const current = window.location.pathname;
			if (current === lastPath) return;
			lastPath = current;
			callback();
		};
		const intervalId = setInterval(fireIfChanged, 1000);
		window.addEventListener('popstate', fireIfChanged);
		return () => {
			clearInterval(intervalId);
			window.removeEventListener('popstate', fireIfChanged);
		};
	}

	function parseUsage(raw) {
		if (!raw || typeof raw !== 'object') return null;
		const normalize = (entry) => {
			if (!entry || typeof entry.utilization !== 'number') return null;
			return {
				utilization: Math.max(0, Math.min(100, entry.utilization)),
				resets_at: typeof entry.resets_at === 'string' ? entry.resets_at : null
			};
		};
		const five_hour = normalize(raw.five_hour);
		const seven_day = normalize(raw.seven_day);
		return five_hour || seven_day ? { five_hour, seven_day } : null;
	}

	const ui = new CC.ui.CounterUI({
		onUsageRefresh: () => refreshUsage()
	});
	ui.initialize();

	let currentOrgId = null;
	let usageInFlight = false;
	let lastUsageMs = 0;

	function attachUi() {
		waitForElement(CC.DOM.MODEL_SELECTOR_DROPDOWN, 60000).then((el) => {
			if (el) ui.attachUsageLine();
		});
	}

	function updateOrgId() {
		const orgId = CC.service.getLastActiveOrgId();
		if (orgId) currentOrgId = orgId;
		return currentOrgId;
	}

	async function refreshUsage() {
		const orgId = updateOrgId();
		if (!orgId || usageInFlight) return;

		usageInFlight = true;
		try {
			const usage = parseUsage(await CC.service.getUsage(orgId));
			if (usage) {
				ui.setUsage(usage);
				lastUsageMs = Date.now();
			}
		} catch {
			// Keep the UI quiet if usage is temporarily unavailable.
		} finally {
			usageInFlight = false;
		}
	}

	function handleRouteChange() {
		attachUi();
		refreshUsage();
	}

	const unobserveUrl = observeUrlChanges(handleRouteChange);
	window.addEventListener('beforeunload', unobserveUrl);

	document.addEventListener('visibilitychange', () => {
		if (!document.hidden) refreshUsage();
	});

	handleRouteChange();
	setInterval(() => {
		ui.tick();
		const now = Date.now();
		if (!document.hidden && now - lastUsageMs > CC.CONST.USAGE_REFRESH_INTERVAL_MS) {
			refreshUsage();
		}
	}, 1000);
})();
