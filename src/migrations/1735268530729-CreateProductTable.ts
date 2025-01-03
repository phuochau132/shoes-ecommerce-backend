import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateProductTable1735268530729 implements MigrationInterface {
  name = 'CreateProductTable1735268530729';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'product',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'price',
            type: 'decimal',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'longtext',
            isNullable: false,
          },
          {
            name: 'handle',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'vendor',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            length: '6',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            length: '6',
            default: 'now()',
            onUpdate: 'now()',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('product');
  }
}
