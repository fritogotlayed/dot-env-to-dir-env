import { describe, it } from '@std/testing/bdd';
import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from '@std/testing/mock';
import { Infrastructure } from './infrastructure.ts';
import { Domain } from './domain.ts';

describe('domain', () => {
  describe('writeDirEnvForPath', () => {
    it('does nothing when no .env file exists', async () => {
      // Arrange
      const getSettingsForPathStub = stub(
        Infrastructure,
        'getSettingsForPath',
        returnsNext([
          Promise.resolve({
            environment: '',
            includeLocal: true,
            lastModified: {},
          }),
        ]),
      );
      const safeReadEnvFileStub = stub(
        Infrastructure,
        'safeReadEnvFile',
        returnsNext([
          Promise.resolve(null),
        ]),
      );
      const writeSettingsForPathStub = stub(
        Infrastructure,
        'writeSettingsForPath',
        returnsNext([
          Promise.resolve(),
        ]),
      );
      const safeWriteDotEnvFileStub = stub(
        Infrastructure,
        'safeWriteDotEnvFile',
        returnsNext([
          Promise.resolve(),
        ]),
      );
      const areFilesModifiedStub = stub(
        Infrastructure,
        'areFilesModified',
        returnsNext([
          Promise.resolve(false),
        ]),
      );

      try {
        // Act
        await Domain.writeDirEnvForPath({
          dirPath: '.',
          env: null,
          includeLocal: undefined,
          silent: true,
        });

        // Assert
        assertSpyCalls(writeSettingsForPathStub, 0);
        assertSpyCalls(safeWriteDotEnvFileStub, 0);
      } finally {
        getSettingsForPathStub.restore();
        safeReadEnvFileStub.restore();
        writeSettingsForPathStub.restore();
        safeWriteDotEnvFileStub.restore();
        areFilesModifiedStub.restore();
      }
    });

    it('writes the direnv file using base, environment, and local file appropriately', async () => {
      // Arrange
      const now = new Date();
      const getSettingsForPathStub = stub(
        Infrastructure,
        'getSettingsForPath',
        returnsNext([
          Promise.resolve({
            environment: 'test',
            includeLocal: true,
            lastModified: {},
          }),
        ]),
      );
      const safeReadEnvFileStub = stub(
        Infrastructure,
        'safeReadEnvFile',
        returnsNext([
          Promise.resolve({
            data: { a: '1', b: '1', c: '1' },
            lastModified: now.getTime(),
          }), // .env
          Promise.resolve({
            data: { b: '2', c: '2' },
            lastModified: now.getTime(),
          }), // .env.test
          Promise.resolve({ data: { b: '3' }, lastModified: now.getTime() }), // .env.local
        ]),
      );
      const writeSettingsForPathStub = stub(
        Infrastructure,
        'writeSettingsForPath',
        returnsNext([
          Promise.resolve(),
        ]),
      );
      const safeWriteDotEnvFileStub = stub(
        Infrastructure,
        'safeWriteDotEnvFile',
        returnsNext([
          Promise.resolve(),
        ]),
      );
      const areFilesModifiedStub = stub(
        Infrastructure,
        'areFilesModified',
        returnsNext([
          Promise.resolve(true),
        ]),
      );

      try {
        // Act
        await Domain.writeDirEnvForPath({
          dirPath: '.',
          env: null,
          includeLocal: undefined,
          silent: true,
        });

        // Assert
        assertSpyCalls(safeReadEnvFileStub, 3);
        assertSpyCall(writeSettingsForPathStub, 0, {
          args: ['.', {
            environment: 'test',
            includeLocal: true,
            lastModified: {
              '.env': now.getTime(),
              '.env.test': now.getTime(),
              '.env.local': now.getTime(),
            },
          }],
        });
        assertSpyCall(safeWriteDotEnvFileStub, 0, {
          args: [{
            dirPath: '.',
            env: 'test',
            data: {
              a: '1',
              b: '3',
              c: '2',
            },
          }],
        });
      } finally {
        getSettingsForPathStub.restore();
        safeReadEnvFileStub.restore();
        writeSettingsForPathStub.restore();
        safeWriteDotEnvFileStub.restore();
        areFilesModifiedStub.restore();
      }
    });

    it('writes the direnv file using base, and environment file appropriately', async () => {
      // Arrange
      const now = new Date();
      const getSettingsForPathStub = stub(
        Infrastructure,
        'getSettingsForPath',
        returnsNext([
          Promise.resolve({
            environment: 'test',
            includeLocal: false,
            lastModified: {},
          }),
        ]),
      );
      const safeReadEnvFileStub = stub(
        Infrastructure,
        'safeReadEnvFile',
        returnsNext([
          Promise.resolve({ data: { a: '1', b: '1', c: '1' }, lastModified: now.getTime() }), // .env
          Promise.resolve({ data: { b: '2', c: '2' }, lastModified: now.getTime() }), // .env.test
        ]),
      );
      const writeSettingsForPathStub = stub(
        Infrastructure,
        'writeSettingsForPath',
        returnsNext([
          Promise.resolve(),
        ]),
      );
      const safeWriteDotEnvFileStub = stub(
        Infrastructure,
        'safeWriteDotEnvFile',
        returnsNext([
          Promise.resolve(),
        ]),
      );
      const areFilesModifiedStub = stub(
        Infrastructure,
        'areFilesModified',
        returnsNext([
          Promise.resolve(true),
        ]),
      );

      try {
        // Act
        await Domain.writeDirEnvForPath({
          dirPath: '.',
          env: null,
          includeLocal: undefined,
          silent: true,
        });

        // Assert
        assertSpyCalls(safeReadEnvFileStub, 2);
        assertSpyCall(writeSettingsForPathStub, 0, {
          args: ['.', {
            environment: 'test',
            includeLocal: false,
            lastModified: {
              '.env': now.getTime(),
              '.env.test': now.getTime(),
            },
          }],
        });
        assertSpyCall(safeWriteDotEnvFileStub, 0, {
          args: [{
            dirPath: '.',
            env: 'test',
            data: {
              a: '1',
              b: '2',
              c: '2',
            },
          }],
        });
      } finally {
        getSettingsForPathStub.restore();
        safeReadEnvFileStub.restore();
        writeSettingsForPathStub.restore();
        safeWriteDotEnvFileStub.restore();
        areFilesModifiedStub.restore();
      }
    });

    it('switches to base env appropriately when instructed to do so', async () => {
      // Arrange
      const now = new Date();
      const getSettingsForPathStub = stub(
        Infrastructure,
        'getSettingsForPath',
        returnsNext([
          Promise.resolve({
            environment: 'test',
            includeLocal: true,
            lastModified: {},
          }),
        ]),
      );
      const safeReadEnvFileStub = stub(
        Infrastructure,
        'safeReadEnvFile',
        returnsNext([
          Promise.resolve({ data: { a: '1', b: '1', c: '1' }, lastModified: now.getTime() }), // .env
          Promise.resolve({ data: { b: '3' }, lastModified: now.getTime() }), // .env.local
        ]),
      );
      const writeSettingsForPathStub = stub(
        Infrastructure,
        'writeSettingsForPath',
        returnsNext([
          Promise.resolve(),
        ]),
      );
      const safeWriteDotEnvFileStub = stub(
        Infrastructure,
        'safeWriteDotEnvFile',
        returnsNext([
          Promise.resolve(),
        ]),
      );
      const areFilesModifiedStub = stub(
        Infrastructure,
        'areFilesModified',
        returnsNext([
          Promise.resolve(true),
        ]),
      );

      try {
        // Act
        await Domain.writeDirEnvForPath({
          dirPath: '.',
          env: '',
          includeLocal: undefined,
          silent: true,
        });

        // Assert
        assertSpyCalls(safeReadEnvFileStub, 2);
        assertSpyCall(writeSettingsForPathStub, 0, {
          args: ['.', {
            environment: '',
            includeLocal: true,
            lastModified: {
              '.env': now.getTime(),
              '.env.local': now.getTime(),
            },
          }],
        });
        assertSpyCall(safeWriteDotEnvFileStub, 0, {
          args: [{
            dirPath: '.',
            env: '',
            data: {
              a: '1',
              b: '3',
              c: '1',
            },
          }],
        });
      } finally {
        getSettingsForPathStub.restore();
        safeReadEnvFileStub.restore();
        writeSettingsForPathStub.restore();
        safeWriteDotEnvFileStub.restore();
        areFilesModifiedStub.restore();
      }
    });

    it('switches the environment appropriately when instructed to do so', async () => {
      // Arrange
      const now = new Date();
      const getSettingsForPathStub = stub(
        Infrastructure,
        'getSettingsForPath',
        returnsNext([
          Promise.resolve({
            environment: 'test',
            includeLocal: true,
            lastModified: {},
          }),
        ]),
      );
      const safeReadEnvFileStub = stub(
        Infrastructure,
        'safeReadEnvFile',
        returnsNext([
          Promise.resolve({
            data: { a: '1', b: '1', c: '1' },
            lastModified: now.getTime(),
          }), // .env
          Promise.resolve({
            data: { b: '2', c: 'bar' },
            lastModified: now.getTime(),
          }), // .env.bar
          Promise.resolve({ data: { b: '3' }, lastModified: now.getTime() }), // .env.local
        ]),
      );
      const writeSettingsForPathStub = stub(
        Infrastructure,
        'writeSettingsForPath',
        returnsNext([
          Promise.resolve(),
        ]),
      );
      const safeWriteDotEnvFileStub = stub(
        Infrastructure,
        'safeWriteDotEnvFile',
        returnsNext([
          Promise.resolve(),
        ]),
      );
      const areFilesModifiedStub = stub(
        Infrastructure,
        'areFilesModified',
        returnsNext([
          Promise.resolve(true),
        ]),
      );

      try {
        // Act
        await Domain.writeDirEnvForPath({
          dirPath: '.',
          env: 'bar',
          includeLocal: undefined,
          silent: true,
        });

        // Assert
        assertSpyCalls(safeReadEnvFileStub, 3);
        assertSpyCall(writeSettingsForPathStub, 0, {
          args: ['.', {
            environment: 'bar',
            includeLocal: true,
            lastModified: {
              '.env': now.getTime(),
              '.env.bar': now.getTime(),
              '.env.local': now.getTime(),
            },
          }],
        });
        assertSpyCall(safeWriteDotEnvFileStub, 0, {
          args: [{
            dirPath: '.',
            env: 'bar',
            data: {
              a: '1',
              b: '3',
              c: 'bar',
            },
          }],
        });
      } finally {
        getSettingsForPathStub.restore();
        safeReadEnvFileStub.restore();
        writeSettingsForPathStub.restore();
        safeWriteDotEnvFileStub.restore();
        areFilesModifiedStub.restore();
      }
    });
  });
});
