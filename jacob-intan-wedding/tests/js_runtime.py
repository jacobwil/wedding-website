"""Evaluate JavaScript using Node.js or the built-in macOS JavaScriptCore."""
import ctypes
import shutil
import subprocess
import sys


def evaluate(program):
    node = shutil.which('node')
    if node:
        return subprocess.run([node, '-e',
            "process.stdout.write(eval(require('fs').readFileSync(0, 'utf8')))"],
            input=program, text=True, capture_output=True, check=True).stdout
    if sys.platform != 'darwin':
        raise RuntimeError('JavaScript checks require Node.js or macOS JavaScriptCore.')
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
        raise RuntimeError('JavaScript error: ' + result)
    return result
