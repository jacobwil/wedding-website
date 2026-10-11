"""Launch local Chromium or connect to the dedicated browser outside the sandbox."""
import os
from pathlib import Path


def open_browser(playwright):
    if os.environ.get('CHROMIUM_CDP_URL'):
        return playwright.chromium.connect_over_cdp(os.environ['CHROMIUM_CDP_URL'])
    options = {'headless': True, 'args': ['--no-sandbox', '--disable-dev-shm-usage']}
    if os.environ.get('CHROMIUM_PATH'):
        options['executable_path'] = os.environ['CHROMIUM_PATH']
    elif not Path(playwright.chromium.executable_path).is_file():
        # A newer browser is already cached on this Mac than the Python package expects.
        cache = Path.home() / 'Library/Caches/ms-playwright'
        candidates = []
        if cache.is_dir():
            for folder in cache.glob('chromium-*'):
                for app in ['Google Chrome for Testing', 'Chromium']:
                    executable = folder / f'chrome-mac-arm64/{app}.app/Contents/MacOS/{app}'
                    if executable.is_file():
                        candidates.append((int(folder.name.rsplit('-', 1)[1]), executable))
        if candidates:
            options['executable_path'] = str(max(candidates)[1])
        else:
            raise RuntimeError('No Chromium found. Run python -m playwright install chromium, or set CHROMIUM_PATH.')
    return playwright.chromium.launch(**options)


def close_browser(browser):
    # Leave the human-launched browser available for subsequent test suites.
    if not os.environ.get('CHROMIUM_CDP_URL'):
        browser.close()
