import { ArgumentValue, Command } from '@cliffy/command';
import { writeDirEnvForPath } from '../../domain.ts';

function nullableBooleanType({ value }: ArgumentValue): boolean | undefined {
  if (value === 'true' || value === '1') {
    return true;
  }
  if (value === 'false' || value === '0') {
    return false;
  }
  return undefined;
}

export const writeEnv = new Command()
  .name('write-env')
  .description('Write the .envrc file')
  .type('nullableBoolean', nullableBooleanType)
  .option(
    '-d, --dir <dir:string>',
    'The directory to create or update a .envrc file. Uses the current working directory if not specified',
  )
  .option(
    '-e, --env <env:string>',
    'The environment to write to the .envrc file',
  )
  // NOTE: If we can figure out how to use -e "" and be valid that would remove the need for the baseEnv option
  //       and we can just use -e "" to indicate that we want to use the base .env file
  //       Look into the `value` callback on the above option.
  //       https://github.com/c4spar/deno-cliffy/issues/731
  .option(
    '--base-env',
    'The environment will no longer be overlayed on top of the base .env file in the output .envrc file',
    { default: false, conflicts: ['env'] },
  )
  .option(
    '--include-local <includeLocal:nullableBoolean>',
    'Includes a .env.local file when merging environment files. This file is merged last',
    { default: undefined },
  )
  .option(
    '-s, --silent',
    'Silences all output. Used with the shell hook to avoid printing the output to the console',
    { default: false },
  )
  .action(async ({ dir, env, baseEnv, includeLocal, silent }) => {
    const targetEnv = baseEnv ? '' : env;
    await writeDirEnvForPath({
      dirPath: dir || Deno.cwd(),
      env: targetEnv ?? null,
      includeLocal: includeLocal,
      silent,
    });
  });
