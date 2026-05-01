(() => {
	'use strict';

	const CC = (globalThis.ClaudeLimitGuard = globalThis.ClaudeLimitGuard || {});

	function formatSeconds(totalSeconds) {
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${String(seconds).padStart(2, '0')}`;
	}

	function formatResetCountdown(timestampMs) {
		const diffMs = timestampMs - Date.now();
		if (!Number.isFinite(diffMs) || diffMs <= 0) return '0m';

		const totalMinutes = Math.round(diffMs / (1000 * 60));
		if (totalMinutes < 60) return `${totalMinutes}m`;

		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		if (hours < 24) return `${hours}h ${minutes}m`;

		const days = Math.floor(hours / 24);
		const remHours = hours % 24;
		return `${days}d ${remHours}h`;
	}

	function setupTooltip(element, tooltip) {
		if (!element || !tooltip) return;
		const show = () => {
			const rect = element.getBoundingClientRect();
			tooltip.style.opacity = '1';
			const tipRect = tooltip.getBoundingClientRect();
			const half = tipRect.width / 2;
			const left = Math.min(window.innerWidth - half - 10, Math.max(half + 10, rect.left + rect.width / 2));
			const top = rect.top - tipRect.height - 8 > 10 ? rect.top - tipRect.height - 8 : rect.bottom + 8;
			tooltip.style.left = `${left}px`;
			tooltip.style.top = `${top}px`;
		};
		const hide = () => {
			tooltip.style.opacity = '0';
		};
		element.addEventListener('pointerenter', show);
		element.addEventListener('pointerleave', hide);
		element.addEventListener('focus', show);
		element.addEventListener('blur', hide);
	}

	function makeTooltip(text) {
		const tip = document.createElement('div');
		tip.className = 'cc-tooltip';
		tip.textContent = text;
		document.body.appendChild(tip);
		return tip;
	}

	function makeUsageGroup(label) {
		const group = document.createElement('span');
		group.className = 'cc-usageGroup';

		const text = document.createElement('span');
		text.className = 'cc-usageText';
		text.textContent = `${label}: --`;

		const bar = document.createElement('span');
		bar.className = 'cc-bar cc-barUsage';

		const fill = document.createElement('span');
		fill.className = 'cc-barFill';
		bar.appendChild(fill);

		const marker = document.createElement('span');
		marker.className = 'cc-barMarker cc-hidden';
		bar.appendChild(marker);

		group.replaceChildren(text, bar);
		return { label, group, text, bar, fill, marker };
	}

	function setUsageLevelClasses(fill, group, pct, nearAt, limitAt) {
		const near = pct >= nearAt && pct < limitAt;
		const limit = pct >= limitAt;
		fill.classList.toggle('cc-barFillNear', near);
		fill.classList.toggle('cc-barFillLimit', limit);
		group.classList.toggle('cc-usageNear', near);
		group.classList.toggle('cc-usageLimit', limit);
	}

	class CounterUI {
		constructor({ onUsageRefresh } = {}) {
			this.onUsageRefresh = onUsageRefresh || null;
			this.headerContainer = null;
			this.tokenText = null;
			this.cacheText = null;
			this.tokenBarFill = null;
			this.usageLine = null;
			this.session = null;
			this.weekly = null;
			this.cachedUntil = null;
			this.usageState = null;
			this.refreshingUsage = false;
			this.domObserver = null;
		}

		initialize() {
			this.headerContainer = document.createElement('div');
			this.headerContainer.className = 'cc-header cc-hidden';
			this.headerContainer.tabIndex = 0;

			this.tokenText = document.createElement('span');
			this.tokenText.className = 'cc-headerText';

			const tokenBar = document.createElement('span');
			tokenBar.className = 'cc-bar cc-barMini';
			this.tokenBarFill = document.createElement('span');
			this.tokenBarFill.className = 'cc-barFill';
			tokenBar.appendChild(this.tokenBarFill);

			this.cacheText = document.createElement('span');
			this.cacheText.className = 'cc-cacheText';

			this.headerContainer.replaceChildren(this.tokenText, tokenBar, this.cacheText);

			this.usageLine = document.createElement('div');
			this.usageLine.className = 'cc-usageRow cc-hidden';
			this.usageLine.tabIndex = 0;
			this.session = makeUsageGroup('Session');
			this.weekly = makeUsageGroup('Weekly');
			this.usageLine.replaceChildren(this.session.group, this.weekly.group);
			this.usageLine.addEventListener('click', async () => {
				if (!this.onUsageRefresh || this.refreshingUsage) return;
				this.refreshingUsage = true;
				this.usageLine.classList.add('cc-dim');
				try {
					await this.onUsageRefresh();
				} finally {
					this.usageLine.classList.remove('cc-dim');
					this.refreshingUsage = false;
				}
			});

			setupTooltip(
				this.headerContainer,
				makeTooltip('Conversation data is read from the same site only to calculate tokens and cache timer. No third-party servers, storage, page injection, or file access.')
			);
			setupTooltip(
				this.usageLine,
				makeTooltip('Usage data is read from the same-site usage API for your logged-in account only. Nothing is sent to third-party servers.')
			);

			this._observeDom();
		}

		_observeDom() {
			let headerPending = false;
			let usagePending = false;
			this.domObserver = new MutationObserver(() => {
				if (!document.contains(this.headerContainer) && !headerPending) {
					headerPending = true;
					CC.waitForElement(CC.DOM.CHAT_MENU_TRIGGER, 60000).then((el) => {
						headerPending = false;
						if (el) this.attachHeader();
					});
				}
				if (!document.contains(this.usageLine) && !usagePending) {
					usagePending = true;
					CC.waitForElement(CC.DOM.MODEL_SELECTOR_DROPDOWN, 60000).then((el) => {
						usagePending = false;
						if (el) this.attachUsageLine();
					});
				}
			});
			this.domObserver.observe(document.body, { childList: true, subtree: true });
		}

		attachHeader() {
			const chatMenu = document.querySelector(CC.DOM.CHAT_MENU_TRIGGER);
			if (!chatMenu) return;
			const anchor = chatMenu.closest(CC.DOM.CHAT_PROJECT_WRAPPER) || chatMenu.parentElement;
			if (anchor && anchor.nextElementSibling !== this.headerContainer) {
				anchor.after(this.headerContainer);
			}
		}

		attachUsageLine() {
			const modelSelector = document.querySelector(CC.DOM.MODEL_SELECTOR_DROPDOWN);
			if (!modelSelector) return;
			const toolbar = this._findToolbarRow(modelSelector);
			const fallback = modelSelector.closest('[data-testid="chat-input-grid-container"]') ||
				modelSelector.closest('[data-testid="chat-input-grid-area"]') ||
				modelSelector.parentElement;
			const anchor = toolbar || fallback;
			if (anchor?.parentElement && anchor.nextElementSibling !== this.usageLine) {
				anchor.after(this.usageLine);
			}
		}

		_findToolbarRow(start) {
			let cur = start;
			while (cur && cur !== document.body) {
				if (cur !== start && cur.nodeType === Node.ELEMENT_NODE) {
					const style = window.getComputedStyle(cur);
					const buttonCount = cur.querySelectorAll('button').length;
					if (style.display === 'flex' && style.flexDirection === 'row' && buttonCount > 1) {
						return cur;
					}
				}
				cur = cur.parentElement;
			}
			return null;
		}

		setConversationMetrics({ totalTokens, cachedUntil } = {}) {
			if (typeof totalTokens !== 'number' || totalTokens <= 0) {
				this.headerContainer.classList.add('cc-hidden');
				this.tokenText.textContent = '';
				this.cacheText.textContent = '';
				this.cachedUntil = null;
				this.tokenBarFill.style.width = '0%';
				return;
			}

			this.headerContainer.classList.remove('cc-hidden');
			const pct = Math.max(0, Math.min(100, (totalTokens / CC.CONST.CONTEXT_LIMIT_TOKENS) * 100));
			this.tokenText.textContent = `~${totalTokens.toLocaleString()} tokens`;
			this.tokenBarFill.style.width = `${pct}%`;
			setUsageLevelClasses(this.tokenBarFill, this.headerContainer, pct, 75, 95);
			this.cachedUntil = typeof cachedUntil === 'number' ? cachedUntil : null;
			this._renderCache();
		}

		setUsage(usage) {
			this.usageState = usage;
			const hasUsage = !!(usage?.five_hour || usage?.seven_day);
			this.usageLine.classList.toggle('cc-hidden', !hasUsage);
			this._renderUsageGroup(this.session, usage?.five_hour, 5 * 60 * 60 * 1000);
			this._renderUsageGroup(this.weekly, usage?.seven_day, 7 * 24 * 60 * 60 * 1000);
		}

		_renderUsageGroup(target, usage, windowMs) {
			if (!target) return;
			if (!usage || typeof usage.utilization !== 'number') {
				target.group.classList.add('cc-hidden');
				target.group.classList.remove('cc-usageNear', 'cc-usageLimit');
				target.fill.classList.remove('cc-barFillNear', 'cc-barFillLimit');
				target.fill.style.width = '0%';
				target.marker.classList.add('cc-hidden');
				return;
			}

			target.group.classList.remove('cc-hidden');
			const pct = Math.max(0, Math.min(100, usage.utilization));
			const resetMs = usage.resets_at ? Date.parse(usage.resets_at) : null;
			const resetText = Number.isFinite(resetMs) ? ` - resets in ${formatResetCountdown(resetMs)}` : '';
			target.text.textContent = `${target.label}: ${Math.round(pct * 10) / 10}%${resetText}`;
			target.fill.style.width = `${pct}%`;
			setUsageLevelClasses(target.fill, target.group, pct, 80, 98);

			if (Number.isFinite(resetMs)) {
				const elapsed = Math.max(0, Math.min(windowMs, Date.now() - (resetMs - windowMs)));
				target.marker.classList.remove('cc-hidden');
				target.marker.style.left = `${(elapsed / windowMs) * 100}%`;
			} else {
				target.marker.classList.add('cc-hidden');
			}
		}

		_renderCache() {
			if (!this.cachedUntil) {
				this.cacheText.textContent = '';
				return;
			}
			const secondsLeft = Math.ceil((this.cachedUntil - Date.now()) / 1000);
			this.cacheText.textContent = secondsLeft > 0 ? `cached for ${formatSeconds(secondsLeft)}` : '';
		}

		tick() {
			this._renderCache();
			if (this.usageState) this.setUsage(this.usageState);
		}
	}

	CC.ui = { CounterUI };
})();
