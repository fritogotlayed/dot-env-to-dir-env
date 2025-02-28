import {
  getSettingsForPath,
  safeReadEnvFile,
  safeWriteDotEnvFile,
  writeSettingsForPath,
} from './infrastructure.ts';

export async function writeDirEnvForPath({
  dirPath,
  env,
  includeLocal,
}: {
  dirPath: string;
  env: string | null;
  includeLocal?: boolean;
}): Promise<void> {
  const workingSettings = await getSettingsForPath(dirPath);
  if (env !== null) {
    workingSettings.environment = env;
  }

  if (includeLocal !== undefined) {
    workingSettings.includeLocal = includeLocal;
  }

  const envFile = `${dirPath}/.env`;
  const baseData = await safeReadEnvFile(envFile);
  if (!baseData) {
    console.log(`No .env file found at ${envFile}`);
    return;
  }

  const envData = await safeReadEnvFile(
    `${dirPath}/.env.${workingSettings.environment}`,
  );
  if (envData) {
    Object.assign(baseData, envData);
  }

  if (workingSettings.includeLocal) {
    const localData = await safeReadEnvFile(`${dirPath}/.env.local`);
    if (localData) {
      Object.assign(baseData, localData);
    }
  }

  await writeSettingsForPath(dirPath, workingSettings);

  await safeWriteDotEnvFile({
    dirPath,
    env: workingSettings.environment,
    data: baseData,
  });
}
