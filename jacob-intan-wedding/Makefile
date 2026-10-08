.PHONY: serve verify test-browser
serve:
	python3 -m http.server 8000 --bind 127.0.0.1 --directory ../serve
verify:
	python3 scripts/verify_repo.py
test-browser:
	python3 tests/test_motion_browser.py
