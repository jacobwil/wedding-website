# Homebrew's versioned Node is keg-only; keep the short commands usable on this Mac.
ifneq ($(wildcard /opt/homebrew/opt/node@24/bin/node),)
export PATH := /opt/homebrew/opt/node@24/bin:$(PATH)
endif

PYTHON ?= $(if $(wildcard ../.venv/bin/python),../.venv/bin/python,python3)

.PHONY: setup build watch export check test-content serve verify test-browser test-migration-browser test-landing
setup:
	npm ci --include=dev
build:
	npm run build
watch:
	npm run watch
export:
	npm run export
check:
	npm run check
test-content:
	npm test
serve:
	python3 -m http.server 8000 --bind 127.0.0.1 --directory ../serve
verify:
	python3 scripts/verify_repo.py
test-browser: export
	$(PYTHON) tests/test_content_browser.py
	$(PYTHON) tests/test_motion_browser.py
	$(PYTHON) tests/test_performance_browser.py
test-migration-browser: export
	$(PYTHON) tests/test_content_browser.py --baseline-ref b2fc2ae
	$(PYTHON) tests/test_motion_browser.py
	$(PYTHON) tests/test_performance_browser.py

test-landing:
	$(PYTHON) tests/test_landing_browser.py
	$(PYTHON) tests/test_review_controls_browser.py
