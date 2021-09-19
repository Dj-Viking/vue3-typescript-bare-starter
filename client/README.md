# vue3-typescript

## Project setup
```sh
npm install
```

## Shell Script info
for the accepting of changes
pass in an environment variable before typing the npm script
```sh
SPECNAME='somespecname.spec.ts'
```

* Example
```sh
SPECNAME='HomeRegression.spec.ts' npm run acceptChanges
```

### Compiles and hot-reloads for development
* I have added a build task in the .vscode directory which does a vue template type checking script
it will also run when `npm run serve` is executed in the shell before vue-cli-service starts the dev server. 
  - to run the command in vscode press the key combination `CMD+Shift+B` and select `npm: tscheck` which will run independently from any other script. this will open it's own terminal window which can be dragged into a set of bash windows
  - this can help for checking a method used in the template that could be missing arguments which the default webpack compilation will not type check the vue template (yet). This is to kind of implement a react-esque type checking which unfortunately is not embedded into the vscode language server. I have yet to find a language server that does realtime type checking as I am writing the code. Unless I move to a completely class based Vue structure which is more like javascript than the template syntax, and can be easily type checked just like a react project. (theoretically)
```sh
npm run serve
```

### Compiles and minifies for production
```sh
npm run build
```

### Run your unit tests
```sh
npm run test:unit
```

### Run your end-to-end tests
```sh
npm run test:e2e
```

### Lints and fixes files
```sh
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
