import { Infrastructure } from './infrastructure.ts';

type ShellSpecificConfiguration = {
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

export class Domain {
  static async writeDirEnvForPath({
    dirPath,
    env,
    includeLocal,
    silent,
    force,
  }: {
    dirPath: string;
    env: string | null;
    includeLocal?: boolean;
    silent?: boolean;
    force?: boolean;
  }) {
    const workingSettings = await Infrastructure.getSettingsForPath(dirPath);
    if (env !== null) {
      workingSettings.environment = env;
    }

    if (includeLocal !== undefined) {
      workingSettings.includeLocal = includeLocal;
    }

    const filesToCheck = [
      '.env',
      workingSettings.environment
        ? `.env.${workingSettings.environment}`
        : null,
      workingSettings.includeLocal ? '.env.local' : null,
    ].filter((f) => f) as string[];

    const hasLocalModifications = await Infrastructure.areFilesModified(
      dirPath,
      filesToCheck,
      workingSettings,
    );

    if (!hasLocalModifications && !force) {
      if (!silent) {
        console.log('No changes to files found. Bypassing processing.');
      }
      return;
    }

    const workingData: Record<string, string> = {};

    for (const fileName of filesToCheck) {
      const filePath = `${dirPath}/${fileName}`;
      const fileData = await Infrastructure.safeReadEnvFile(filePath);

      if (fileData) {
        workingSettings.lastModified[fileName] = fileData.lastModified;
        Object.assign(workingData, fileData.data);
      } else if (fileName === '.env') {
        // Base .env file is required
        if (!silent) {
          console.log(`No .env file found at $src/domain.ts`);
        }
        return;
      }
    }

    await Infrastructure.writeSettingsForPath(dirPath, workingSettings);

    await Infrastructure.safeWriteDotEnvFile({
      dirPath,
      env: workingSettings.environment,
      data: workingData,
    });
  }
}
