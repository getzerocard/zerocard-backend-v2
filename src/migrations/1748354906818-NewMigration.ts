import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1748354906818 implements MigrationInterface {
    name = 'NewMigration1748354906818'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction_chunk" RENAME COLUMN "nairaUsed" TO "fiatUsed"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "nairaAmount"`);
        await queryRunner.query(`ALTER TABLE "spending_limits" DROP COLUMN "nairaAmount"`);
        await queryRunner.query(`ALTER TABLE "spending_limits" DROP COLUMN "nairaRemaining"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "fiatAmount" numeric(18,2) DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "fiatCode" character varying(10)`);
        await queryRunner.query(`ALTER TABLE "spending_limits" ADD "fiatAmount" numeric(18,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "spending_limits" ADD "fiatRemaining" numeric(18,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "spending_limits" DROP COLUMN "fiatRemaining"`);
        await queryRunner.query(`ALTER TABLE "spending_limits" DROP COLUMN "fiatAmount"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "fiatCode"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "fiatAmount"`);
        await queryRunner.query(`ALTER TABLE "spending_limits" ADD "nairaRemaining" numeric(18,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "spending_limits" ADD "nairaAmount" numeric(18,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "nairaAmount" numeric(18,2) DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "transaction_chunk" RENAME COLUMN "fiatUsed" TO "nairaUsed"`);
    }

}
