#!/usr/bin/env fish
lima tangle README.md
and npm run build
and ./bin/lima.js tangle README.md
and npm run build
and ./bin/lima.js tangle README.md
and rm .gitignore
and npm publish
echo '*' > .gitignore
