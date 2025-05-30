import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1748569576426 implements MigrationInterface {
    name = 'NewMigration1748569576426'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "usdAmount" TYPE numeric(18,6)`);
        await queryRunner.query(`ALTER TABLE "transaction_chunk" ALTER COLUMN "usdEquivalent" TYPE numeric(10,6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction_chunk" ALTER COLUMN "usdEquivalent" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "usdAmount" TYPE numeric(18,2)`);
    }

}
