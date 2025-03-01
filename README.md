# Dot env to direnv

`dot2dir` is a project born out of the need to quickly collapse a set of `.env`/`.env.name` files
into a single `.envrc` file that can be used with [direnv](https://direnv.net/). The `.env` files
were created to be compatible with [node-config](https://github.com/node-config/node-config) but 
are not consumable by the `direnv` tool given the slightly different syntax.

## Installation

### Using Released Binaries

TODO

### Using Development Build

The following example assumes you have the dependencies installed and your `$PATH` includes the
`.local/bin` directory. Adjust paths as needed for your environment.

```shell
deno task build
ln -s /path/to/source/bin/dot2dir-[architecture] ~/.local/bin/dot2dir
```

To utilize the `dot2dir` shell hook, update your shell configuration to include the following before the direnv hook.

NOTE: Currently only `zsh` is supported. Other shell support welcomed via PR.

```shell
eval "$(dot2dir hook zsh)"
```

## Development

### Dependencies

- [deno 2.0+](https://deno.land/)

### Local Testing

```shell
deno task dev:start [command] <arguments>
```