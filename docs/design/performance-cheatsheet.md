<!--
Source: https://github.com/emilkowalski/skills/blob/64eb3deb9a5fbfa041faf783e0bc3fd635872e9c/performance-cheatsheet.md
Copied unchanged. Licensed under the MIT License; the full notice is at the end of this file.
-->

# Performance Cheatsheet

| Problem                             | Solution                                                  |
| ----------------------------------- | --------------------------------------------------------- |
| Animation stutters                  | Animate `transform`/`opacity`, not `width`/`top`          |
| Long list scrolls slowly            | Virtualize — only render what's visible                   |
| Blur causes perf issues             | Keep animated `blur()` under 20px                         |
| Motion's `x`/`y` drops frames       | Upgrade to `motion` 14.2+, or use a `transform` string    |
| Random properties animate           | Don't do `transition: all`, list exact properties         |
| React re-renders every frame        | Write to `ref.current.style`, not state                   |
| Element shifts 1px as motion starts | `will-change: transform` (only once you see it)           |

---

## License

```
MIT License

Copyright (c) 2026 Emil Kowalski

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
