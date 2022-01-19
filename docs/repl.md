# Swan REPL

The swan package comes with a CLI REPL meant to be used for testing purposes or
to play around with the swan interpreter:

```sh
Swan v0.8.0
Usage: swan [options]

Options:
  -V, --version        output the version number
  -i, --import <path>  run a Swan script before starting the REPL
  -h, --help           display help for command
```

You can start the interpreter with one of the following commands:

* `swan` if you installed the package globally
* `npx swan` if you installed the package as a dependency
* `./bin/swan` if you pulled the package and you are in the root directory

Once you start the REPL, you get a `>>>` prompt where you can enter swan 
expressions. By pressing enter the expression gets evaluated and its
result serialized and displayed.

Optionally, if you type `swan -i <path>`, the swan script at the given path
gets executed before starting the REPL. All the values and functions defined in 
the imported scripts are then available at the prompt.

