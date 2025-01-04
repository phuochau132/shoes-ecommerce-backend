import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateProductVariantOptionValueTable1735269961441
  implements MigrationInterface
{
  name = 'CreateProductVariantOptionValueTable1735269961441';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'product_variant_option_value',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'variant_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'option_value_id',
            type: 'bigint',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'product_variant_option_value',
      new TableForeignKey({
        columnNames: ['variant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product_variant',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'product_variant_option_value',
      new TableForeignKey({
        columnNames: ['option_value_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'option_value',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('product_variant_option_value');
    if (table) {
      const foreignKeyVariant = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('variant_id') !== -1,
      );
      const foreignKeyOptionValue = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('option_value_id') !== -1,
      );
      if (foreignKeyVariant) {
        await queryRunner.dropForeignKey(
          'product_variant_option_value',
          foreignKeyVariant,
        );
      }
      if (foreignKeyOptionValue) {
        await queryRunner.dropForeignKey(
          'product_variant_option_value',
          foreignKeyOptionValue,
        );
      }
    }
    await queryRunner.dropTable('product_variant_option_value');
  }
}
