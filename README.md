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

## Development

### Dependencies

- [deno 2.0+](https://deno.land/)

### Local Testing

```shell
deno task dev:start [command] <arguments>
```