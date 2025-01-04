import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateProductVariantTable1735269565629
  implements MigrationInterface
{
  name = 'CreateProductVariantTable1735269565629';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'product_variant',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'product_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'sku',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'price',
            type: 'decimal',
            isNullable: false,
          },
          {
            name: 'stock',
            type: 'decimal',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'product_variant',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('product_variant');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('product_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('product_variant', foreignKey);
      }
      await queryRunner.dropTable('product_variant');
    }
  }
}
