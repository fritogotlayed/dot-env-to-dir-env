import { Command } from '@cliffy/command';
import { SHELL_SPECIFIC_CONFIGURATION } from '../../domain.ts';

export const hook = new Command()
  .name('hook')
  .description('Used to setup the shell hook')
  .arguments('<shell>')
  .action((_, shell) => {
    // TODO: Separate presentation from domain
    const configuration = SHELL_SPECIFIC_CONFIGURATION[shell];
    if (!configuration) {
      console.log(
        `Unsupported shell: ${shell}. Only the following shells are supported at this time: ${
          Object.keys(SHELL_SPECIFIC_CONFIGURATION).join(', ')
        }`,
      );
      Deno.exit(1);
    }

    console.log(configuration.hook);
  });
