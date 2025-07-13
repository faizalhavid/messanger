import { FriendshipStatusEnum, MarkableTypeEnum, ThreadTypeEnum } from 'packages/types';
import path from 'path';
import { write, file } from 'bun';

const ENUM_BLOCK_START = '// BEGIN ENUMS';
const ENUM_BLOCK_END = '// END ENUMS';

const SCHEMA_PATH = path.resolve(__dirname, './schema.prisma');
const BACKUP_PATH = path.resolve(__dirname, './schema-backup.txt');

const generateEnum = (name: string, enumObject: object) => {
  const values = Object.values(enumObject)
    .filter((v) => typeof v === 'string')
    .map((v) => `  ${v}`)
    .join('\n');
  return `enum ${name} {\n${values}\n}`;
};

const generatedEnumContent = ['// This file is auto generated. Do not edit manually.', generateEnum('MarkableTypeEnum', MarkableTypeEnum), generateEnum('ThreadTypeEnum', ThreadTypeEnum), generateEnum('FriendshipStatusEnum', FriendshipStatusEnum)].join('\n\n');

(async () => {
  const originalText = await file(SCHEMA_PATH).text();

  // Backup
  await write(BACKUP_PATH, originalText);

  // Replace ENUM block
  const enumRegex = new RegExp(`${ENUM_BLOCK_START}[\\s\\S]*?${ENUM_BLOCK_END}`);
  const replaced = originalText.replace(enumRegex, `${ENUM_BLOCK_START}\n\n${generatedEnumContent}\n\n${ENUM_BLOCK_END}`);

  await write(SCHEMA_PATH, replaced);

  console.log('✅ schema.prisma updated with latest enums and backup saved');
})();
