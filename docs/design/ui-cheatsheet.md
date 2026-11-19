<!--
Source: https://github.com/emilkowalski/skills/blob/64eb3deb9a5fbfa041faf783e0bc3fd635872e9c/ui-cheatsheet.md
Copied unchanged. Licensed under the MIT License; the full notice is at the end of this file.
-->

# UI Cheatsheet

| Problem                            | Solution                                                     |
| ---------------------------------- | ------------------------------------------------------------ |
| Old timestamps read "340 days ago" | Switch to an absolute date after a week                      |
| Numbers jitter when they change    | `font-variant-numeric: tabular-nums`                         |
| Large headings look off            | Tighter tracking like `-0.02em`                              |
| Body text looks awkward            | Cap the line at about 65 characters with `max-width: 65ch`   |
| Button feels unresponsive          | `transform: scale(0.97)` on `:active`                        |
| Avatar squished into an oval       | `flex-shrink: 0` on the avatar                               |
| Gradient fade has a visible edge   | Use an eased gradient: extra color stops along an ease curve |
| Transition still feels off         | Add `filter: blur(2px)` during the transition                |
| Dropdown feels sluggish            | `ease-out` under 300ms, never `ease-in`                      |
| Popover grows from the wrong spot  | `transform-origin` at the trigger (modals stay centered)     |
| Count reads "1 members"            | Pluralize with `Intl.PluralRules`                            |

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
