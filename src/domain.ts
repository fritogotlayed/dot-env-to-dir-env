import { Infrastructure } from './infrastructure.ts';

export async function writeDirEnvForPath({
  dirPath,
  env,
  includeLocal,
  silent,
}: {
  dirPath: string;
  env: string | null;
  includeLocal?: boolean;
  silent?: boolean;
}): Promise<void> {
  const workingSettings = await Infrastructure.getSettingsForPath(dirPath);
  if (env !== null) {
    workingSettings.environment = env;
  }

  if (includeLocal !== undefined) {
    workingSettings.includeLocal = includeLocal;
  }

  const envFile = `${dirPath}/.env`;
  const baseData = await Infrastructure.safeReadEnvFile(envFile);
  if (!baseData) {
    if (!silent) {
      console.log(`No .env file found at ${envFile}`);
    }
    return;
  }

  const envData = await Infrastructure.safeReadEnvFile(
    `${dirPath}/.env.${workingSettings.environment}`,
  );
  if (envData) {
    Object.assign(baseData, envData);
  }

  if (workingSettings.includeLocal) {
    const localData = await Infrastructure.safeReadEnvFile(
      `${dirPath}/.env.local`,
    );
    if (localData) {
      Object.assign(baseData, localData);
    }
  }

  await Infrastructure.writeSettingsForPath(dirPath, workingSettings);

  await Infrastructure.safeWriteDotEnvFile({
    dirPath,
    env: workingSettings.environment,
    data: baseData,
  });
}

export type ShellSpecificConfiguration = {
  hook: string;
};

export const SHELL_SPECIFIC_CONFIGURATION: Record<
  string,
  ShellSpecificConfiguration
> = {
  zsh: {
    hook: `
_dot2dir_hook() {
  trap -- '' SIGINT;
  eval "$(dot2dir write-env -s)";
  trap - SIGINT;
}
typeset -ag precmd_functions;
if [[ -z \${precmd_functions[(r)_dot2dir_hook]} ]]; then
  precmd_functions=( _dot2dir_hook \${precmd_functions[@]} )
fi
typeset -ag chpwd_functions;
if [[ -z \${chpwd_functions[(r)_dot2dir_hook]} ]]; then
  chpwd_functions=( _dot2dir_hook \${chpwd_functions[@]} )
fi`,
  },
};
