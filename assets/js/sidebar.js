// Sidebar toggle with localStorage persistence
// Adds/removes class on body: sidebar-collapsed
// Persists state across navigations using key 'sidebarCollapsed'
// Handles accessible aria-expanded attribute and transforms burger into X

(function() {
	const STORAGE_KEY = 'sidebarCollapsed';
		const body = document.body;
		const root = document.documentElement;
	const toggleBtn = document.getElementById('sidebarToggle');
	if (!toggleBtn) return;

	function applyState(collapsed) {
				if (collapsed) {
					root.classList.add('sidebar-collapsed');
					root.classList.remove('sidebar-expanded');
					body.classList.add('sidebar-collapsed');
					body.classList.remove('sidebar-expanded');
			toggleBtn.setAttribute('aria-expanded', 'false');
			toggleBtn.classList.add('is-collapsed');
		} else {
					root.classList.remove('sidebar-collapsed');
					root.classList.add('sidebar-expanded');
					body.classList.remove('sidebar-collapsed');
					body.classList.add('sidebar-expanded');
			toggleBtn.setAttribute('aria-expanded', 'true');
			toggleBtn.classList.remove('is-collapsed');
		}
	}

	// Initialize from storage
	let initial = false;
	try {
		initial = localStorage.getItem(STORAGE_KEY) === '1';
	} catch(e) {}
	applyState(initial);

		// Remove preload class after first frame to re-enable transitions
		requestAnimationFrame(() => {
			document.documentElement.classList.remove('preload');
		});

		toggleBtn.addEventListener('click', () => {
			const isExpanded = root.classList.contains('sidebar-expanded');
			const willCollapse = isExpanded; // if expanded, we will collapse
			applyState(willCollapse); // collapsed param expects boolean collapsed
			try {
				localStorage.setItem(STORAGE_KEY, willCollapse ? '1' : '0');
			} catch(e) {}
		});

	// Close sidebar with Escape when focused inside sidebar and not already collapsed
	document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && !root.classList.contains('sidebar-collapsed')) {
			applyState(true);
			try { localStorage.setItem(STORAGE_KEY, '1'); } catch(e) {}
		}
	});

		// Handle bfcache restore (back navigation) without flash
		window.addEventListener('pageshow', function(ev){
			if (ev.persisted) {
				let persisted = false; try { persisted = localStorage.getItem(STORAGE_KEY) === '1'; } catch(e) {}
				applyState(persisted);
			}
		});
})();
