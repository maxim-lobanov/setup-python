import sys
print(sys.version)

if int(sys.version_info.major) == 3:
    import tkinter as tk
else:
    import Tkinter as tk

tk_version = -1
tk_version = tk.TkVersion
if tk_version == -1:
    exit(1)
print(tk.TkVersion)