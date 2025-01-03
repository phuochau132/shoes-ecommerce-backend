import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateOptionValueTable1735269871483 implements MigrationInterface {
  name = 'CreateOptionValueTable1735269871483';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'option_value',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'option_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'value',
            type: 'varchar',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'option_value',
      new TableForeignKey({
        columnNames: ['option_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'option',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('option_value');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('option_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('option_value', foreignKey);
      }
      await queryRunner.dropTable('option_value');
    }
  }
}
