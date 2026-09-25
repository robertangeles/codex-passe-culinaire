# Local typefaces

Fraunces, Inter and JetBrains Mono are served from this directory with their bundled licences. No font host is contacted by the browser.

`fraunces-og.ttf` is a static instance of `fraunces-latin-variable.woff2`, generated with fontTools at optical size 72 and weight 400. The remaining Fraunces axes are pinned to their defaults and all variation tables are removed because the server image renderer does not support variable-font metadata. It is used only by the server's image renderer. The existing Fraunces licence also covers this derived instance. Browser typography continues to use the original variable WOFF2.
