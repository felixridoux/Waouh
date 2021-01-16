ast.js: WHILE syntax tree implementation

exec.js: step-by-step interactions

final.js: a merge of ast.js, exec.js, parserUtils.js, parserWhile.js in a unique file using the browserify tool:
                 browserify exec.js -o final.js
Very useful because common browsers do not support module dependencies.
                 http://browserify.org/

index.html: application home page

main.css: stylesheet of the interface

main.html: interpreter page

parserUtils.js: parsing tools

parserWhile.js: WHILE parser

Report.pdf: project description