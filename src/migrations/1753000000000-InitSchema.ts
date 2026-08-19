import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial schema for the Nomenclator backend (design D4): hand-written so it is
 * deterministic on a fresh Neon database.
 *
 * Column naming follows each entity EXACTLY as committed:
 * - users/likes keep the camelCase column names their entities define
 *   (User has no explicit `name`, so TypeORM resolves "isActive"/"createdAt";
 *   Like declares `name: 'userId'` / `name: 'postalId'`).
 * - postals keeps `image_url` (explicit snake_case in Postal entity).
 * - saved_items uses explicit snake_case columns (user_id, item_type, item_id,
 *   created_at) as defined in the SavedItem entity.
 *
 * The enum type for saved_items.item_type is named after the TypeORM default
 * convention (`<table>_<column>_enum`) so entity and migration agree.
 *
 * Run with: npm run migration:run (uses src/data-source.ts + DIRECT_DATABASE_URL).
 * Rollback: npm run migration:revert.
 */
export class InitSchema1753000000000 implements MigrationInterface {
  name = 'InitSchema1753000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "postals" (
        "id" character varying NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        "price" numeric(10,2) NOT NULL,
        "category" character varying NOT NULL,
        "image_url" character varying,
        CONSTRAINT "PK_postals" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "likes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "postalId" character varying NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_likes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_likes_user_postal" UNIQUE ("userId", "postalId")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "saved_items_item_type_enum" AS ENUM ('street', 'postal')
    `);

    await queryRunner.query(`
      CREATE TABLE "saved_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "item_type" "saved_items_item_type_enum" NOT NULL,
        "item_id" character varying NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_saved_items" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_saved_items_user_type_item" UNIQUE ("user_id", "item_type", "item_id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "likes"
        ADD CONSTRAINT "FK_likes_user" FOREIGN KEY ("userId")
        REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "likes"
        ADD CONSTRAINT "FK_likes_postal" FOREIGN KEY ("postalId")
        REFERENCES "postals"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "saved_items"
        ADD CONSTRAINT "FK_saved_items_user" FOREIGN KEY ("user_id")
        REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Seed the 4 postals from the front catalog (src/data/products.ts:
    // p3/p5/p7/p9) idempotently (design D4).
    await queryRunner.query(`
      INSERT INTO "postals" ("id", "name", "description", "price", "category")
      VALUES
        ('p3', 'Postal Colección Nomenclador', 'Set de 10 postales con las calles más emblemáticas del Centro Histórico.', 25000, 'Postales'),
        ('p5', 'Postal Calle del Arzobispado', 'Postal individual de la Calle del Arzobispado con su historia al respaldo.', 5000, 'Postales'),
        ('p7', 'Set Postales Monumentos', 'Set de 5 postales con los monumentos históricos más representativos.', 18000, 'Postales'),
        ('p9', 'Postal Bastión de San Felipe', 'Postal del Bastión de San Felipe con datos históricos.', 5000, 'Postales')
      ON CONFLICT ("id") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "saved_items"`);
    await queryRunner.query(`DROP TYPE "saved_items_item_type_enum"`);
    await queryRunner.query(`DROP TABLE "likes"`);
    await queryRunner.query(`DROP TABLE "postals"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}