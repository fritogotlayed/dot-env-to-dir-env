import { Command, ValidationError } from '@cliffy/command';
import { writeEnv } from './commands/write-env.ts';
import { hook } from './commands/hook.ts';

await new Command()
  .name('dot2dir')
  .description('Generate .envrc files from .env and .env.[environment] files')
  .version('0.0.1')
  .usage('<sub-command> [options]')
  .action(() => {
    throw new ValidationError('No sub-command specified');
  })
  .command('write-env', writeEnv).alias('writeEnv')
  .command('hook', hook)
  .parse(Deno.args);
