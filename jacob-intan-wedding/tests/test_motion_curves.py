"""Run the browser suite's curve checks with Node or macOS JavaScriptCore."""
import ast
import ctypes
import json
import shutil
import subprocess
import sys
from pathlib import Path

base = Path(__file__).resolve().parents[1]
source = (base / 'script.js').read_text()
test_ast = ast.parse((base / 'tests/test_motion_browser.py').read_text())
checks = next(ast.literal_eval(node.value) for node in test_ast.body
              if isinstance(node, ast.Assign) and any(
                  isinstance(t, ast.Name) and t.id == 'JS' for t in node.targets))
checks = checks.replace('async () =>', '() =>').split('  const rendered=[];')[0]
checks += '''
  return {names:[...signatures].sort(), minSep, profileNames:[...profilesSeen],
    cases,maxSpeedStep,maxRestScale,maxRestTilt,errors:errors.slice(0,8)};
}'''
program = '''
const document={documentElement:{dataset:{motionSet:'limited'}}};
const window={};
const random=(a,b)=>a+Math.random()*(b-a);
const choose=items=>items[Math.floor(Math.random()*items.length)];
''' + source[source.index('  const pose ='):source.index('  let deck = shuffle(ART);')]
program += source[source.index('  const FIRST_ENTRY_SEPARATION'):source.index('  let firstEntryAngle = null;')]
program += source[source.index('  function circularSeparation'):source.index('  function animateLanding')]
program += '\nwindow.__motionDebug={profiles:SELECTED_MOTION_PROFILES,chooseEntryVector,circularSeparation};\n'
program += 'JSON.stringify((' + checks + ')());'

node = shutil.which('node')
if node:
    result = subprocess.run([node, '-e',
        "process.stdout.write(eval(require('fs').readFileSync(0, 'utf8')))"],
        input=program, text=True, capture_output=True, check=True).stdout
elif sys.platform == 'darwin':
    lib = ctypes.CDLL('/System/Library/Frameworks/JavaScriptCore.framework/JavaScriptCore')
    ptr = ctypes.c_void_p
    signatures = {
        'JSGlobalContextCreate': ([ptr], ptr),
        'JSGlobalContextRelease': ([ptr], None),
        'JSStringCreateWithUTF8CString': ([ctypes.c_char_p], ptr),
        'JSStringRelease': ([ptr], None),
        'JSEvaluateScript': ([ptr, ptr, ptr, ptr, ctypes.c_int, ctypes.POINTER(ptr)], ptr),
        'JSValueToStringCopy': ([ptr, ptr, ctypes.POINTER(ptr)], ptr),
        'JSStringGetMaximumUTF8CStringSize': ([ptr], ctypes.c_size_t),
        'JSStringGetUTF8CString': ([ptr, ptr, ctypes.c_size_t], ctypes.c_size_t),
    }
    for name, (args, return_type) in signatures.items():
        getattr(lib, name).argtypes = args
        getattr(lib, name).restype = return_type
    context = lib.JSGlobalContextCreate(None)
    script = lib.JSStringCreateWithUTF8CString(program.encode())
    exception = ptr()
    value = lib.JSEvaluateScript(context, script, None, None, 1, ctypes.byref(exception))
    string = lib.JSValueToStringCopy(context, exception.value if exception.value else value, None)
    size = lib.JSStringGetMaximumUTF8CStringSize(string)
    buffer = ctypes.create_string_buffer(size)
    lib.JSStringGetUTF8CString(string, buffer, size)
    result = buffer.value.decode()
    lib.JSStringRelease(string)
    lib.JSStringRelease(script)
    lib.JSGlobalContextRelease(context)
    if exception.value:
        raise SystemExit('JavaScript error: ' + result)
else:
    raise SystemExit('Curve checks require Node.js or macOS JavaScriptCore; alternatively run the Playwright browser suite.')
result = json.loads(result)
print(json.dumps(result, indent=2))
assert not result['errors'], result['errors']
assert len(result['profileNames']) == 3
assert len(result['names']) == 8
print('PASS: actual JavaScript builders; 432 motion cases; no reversals, scale growth, abrupt speed steps, or visible final-release parameters.')
print('This checks curves only; run test_motion_browser.py to verify browser rendering and WAAPI cleanup.')
