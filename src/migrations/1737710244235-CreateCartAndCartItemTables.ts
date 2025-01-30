import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateCartAndCartItemTables1737710244235
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'cart',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'total_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
        ],
      }),
    );

    // Add foreign key for 'cart.user_id'
    await queryRunner.createForeignKey(
      'cart',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      }),
    );

    // Create 'cart_item' table
    await queryRunner.createTable(
      new Table({
        name: 'cart_item',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'cart_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'product_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'variant_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'quantity',
            type: 'int',
            isNullable: false,
            default: 1,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
        ],
      }),
    );

    // Add foreign key for 'cart_item.cart_id'
    await queryRunner.createForeignKey(
      'cart_item',
      new TableForeignKey({
        columnNames: ['cart_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'cart',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key for 'cart_item.product_id'
    await queryRunner.createForeignKey(
      'cart_item',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const cartItemTable = await queryRunner.getTable('cart_item');
    if (cartItemTable) {
      const cartIdForeignKey = cartItemTable.foreignKeys.find((fk) =>
        fk.columnNames.includes('cart_id'),
      );
      if (cartIdForeignKey) {
        await queryRunner.dropForeignKey('cart_item', cartIdForeignKey);
      }

      const productIdForeignKey = cartItemTable.foreignKeys.find((fk) =>
        fk.columnNames.includes('product_id'),
      );
      if (productIdForeignKey) {
        await queryRunner.dropForeignKey('cart_item', productIdForeignKey);
      }

      await queryRunner.dropTable('cart_item');
    }

    const cartTable = await queryRunner.getTable('cart');
    if (cartTable) {
      const userIdForeignKey = cartTable.foreignKeys.find((fk) =>
        fk.columnNames.includes('user_id'),
      );
      if (userIdForeignKey) {
        await queryRunner.dropForeignKey('cart', userIdForeignKey);
      }
      await queryRunner.dropTable('cart');
    }
  }
}
