import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateOrderAndOrderItemTables1737710244237
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'order',
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
            name: 'detail_address',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'city',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'postal_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'country',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'note',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'cart_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'paid', 'failed'],
            default: "'pending'",
          },
          {
            name: 'payment_method',
            type: 'enum',
            enum: ['cash_on_delivery', 'paypal'],
            default: "'cash_on_delivery'",
          },
          {
            name: 'is_paid',
            type: 'boolean',
            default: false,
          },
          {
            name: 'total_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
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
    await queryRunner.createTable(
      new Table({
        name: 'order_item',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'order_id',
            type: 'bigint',
            length: '36',
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

    // Add foreign key for 'order.user_id'
    await queryRunner.createForeignKey(
      'order',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key for 'order.cart_id'
    await queryRunner.createForeignKey(
      'order',
      new TableForeignKey({
        columnNames: ['cart_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'cart',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'order_item',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'order',
        onDelete: 'CASCADE',
      }),
    );

    // Thêm khóa ngoại cho product_id
    await queryRunner.createForeignKey(
      'order_item',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const orderTable = await queryRunner.getTable('order');
    if (orderTable) {
      const userIdForeignKey = orderTable.foreignKeys.find((fk) =>
        fk.columnNames.includes('user_id'),
      );
      if (userIdForeignKey) {
        await queryRunner.dropForeignKey('order', userIdForeignKey);
      }

      const cartIdForeignKey = orderTable.foreignKeys.find((fk) =>
        fk.columnNames.includes('cart_id'),
      );
      if (cartIdForeignKey) {
        await queryRunner.dropForeignKey('order', cartIdForeignKey);
      }
      await queryRunner.dropTable('order');
    }
    const orderItemTable = await queryRunner.getTable('order_item');
    if (orderItemTable) {
      const orderIdForeignKey = orderItemTable.foreignKeys.find((fk) =>
        fk.columnNames.includes('order_id'),
      );
      if (orderIdForeignKey) {
        await queryRunner.dropForeignKey('order_item', orderIdForeignKey);
      }

      const productIdForeignKey = orderItemTable.foreignKeys.find((fk) =>
        fk.columnNames.includes('product_id'),
      );
      if (productIdForeignKey) {
        await queryRunner.dropForeignKey('order_item', productIdForeignKey);
      }

      await queryRunner.dropTable('order_item');
    }
  }
}
