import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateProductCollectionTable1736041515084
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'product_collection',
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
            name: 'collection_id',
            type: 'bigint',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'product_collection',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedTableName: 'product',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'product_collection',
      new TableForeignKey({
        columnNames: ['collection_id'],
        referencedTableName: 'collection',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('product_collection');
    if (table) {
      const productForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('product_id') !== -1,
      );
      const collectionForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('collection_id') !== -1,
      );

      if (productForeignKey) {
        await queryRunner.dropForeignKey(
          'product_collection',
          productForeignKey,
        );
      }

      if (collectionForeignKey) {
        await queryRunner.dropForeignKey(
          'product_collection',
          collectionForeignKey,
        );
      }

      await queryRunner.dropTable('product_collection');
    }
  }
}
