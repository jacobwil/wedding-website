"""Run the browser suite's curve checks with Node or macOS JavaScriptCore."""
import ast
import json
from pathlib import Path
from js_runtime import evaluate

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

result = json.loads(evaluate(program))
print(json.dumps(result, indent=2))
assert not result['errors'], result['errors']
assert len(result['profileNames']) == 3
assert len(result['names']) == 8
print('PASS: actual JavaScript builders; 432 motion cases; no reversals, scale growth, abrupt speed steps, or visible final-release parameters.')
print('This checks curves only; run test_motion_browser.py to verify browser rendering and WAAPI cleanup.')
