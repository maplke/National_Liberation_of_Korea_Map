"""Make a capture-only copy of the game HTML with a debug hook (window.__ev) so the
capture script can drive the camera, skin, time of day and the game loop.
The original game file is not modified.
usage: python3 make_capture_copy.py <game.html> <cap.html>"""
import sys
src = open(sys.argv[1], encoding='utf-8').read()
anchor = 'reset();paint();\n})();'
assert src.count(anchor) == 1, 'anchor not found: game build changed?'
src = src.replace(anchor, 'reset();paint();\nwindow.__ev=function(s){return eval(s)};\n})();')
open(sys.argv[2], 'w', encoding='utf-8').write(src)
print('wrote', sys.argv[2])
