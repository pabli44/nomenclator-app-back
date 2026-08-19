import { MigrationInterface, QueryRunner } from 'typeorm';
import { InitSchema1753000000000 } from './1753000000000-InitSchema';

describe('InitSchema migration (REQ-SD-2/3, D4)', () => {
  const buildQueryRunner = () => {
    const query = jest.fn().mockResolvedValue(undefined);
    const queryRunner = { query } as unknown as QueryRunner;
    return { queryRunner, query };
  };

  const runUp = async () => {
    const migration = new InitSchema1753000000000();
    const { queryRunner, query } = buildQueryRunner();
    await migration.up(queryRunner);
    const statements = (query as jest.Mock).mock.calls.map((call) => call[0]);
    return { migration, statements };
  };

  it('is a TypeORM migration with up and down methods', () => {
    const migration = new InitSchema1753000000000() as MigrationInterface;

    expect(typeof migration.up).toBe('function');
    expect(typeof migration.down).toBe('function');
  });

  it('creates the users table with the User entity columns', async () => {
    const { statements } = await runUp();

    const users = statements.find((s: string) => s.includes('CREATE TABLE "users"'));
    expect(users).toBeDefined();
    expect(users).toContain('"id" uuid');
    expect(users).toContain('"email" character varying');
    expect(users).toContain('UNIQUE');
    expect(users).toContain('"isActive" boolean');
    expect(users).toContain('"createdAt" TIMESTAMP WITH TIME ZONE');
    expect(users).toContain('"updatedAt" TIMESTAMP WITH TIME ZONE');
  });

  it('creates the postals table with a numeric price and image_url', async () => {
    const { statements } = await runUp();

    const postals = statements.find((s: string) =>
      s.includes('CREATE TABLE "postals"'),
    );
    expect(postals).toBeDefined();
    expect(postals).toContain('"price" numeric(10,2)');
    expect(postals).toContain('"image_url" character varying');
    expect(postals).toContain('PRIMARY KEY ("id")');
  });

  it('creates the likes table with FK and unique constraints on userId/postalId', async () => {
    const { statements } = await runUp();

    const likes = statements.find((s: string) =>
      s.includes('CREATE TABLE "likes"'),
    );
    expect(likes).toBeDefined();
    expect(likes).toContain('"userId" uuid');
    expect(likes).toContain('"postalId" character varying');
    expect(likes).toContain('CONSTRAINT "UQ_likes_user_postal" UNIQUE ("userId", "postalId")');

    const likeFks = statements.filter((s: string) =>
      s.includes('ALTER TABLE "likes"'),
    );
    expect(likeFks).toHaveLength(2);
    expect(likeFks[0]).toContain('REFERENCES "users"("id")');
    expect(likeFks[1]).toContain('REFERENCES "postals"("id")');
    expect(likeFks.join(' ')).toContain('ON DELETE CASCADE');
  });

  it('creates the saved_items table with the item_type enum and triple unique', async () => {
    const { statements } = await runUp();

    const savedItems = statements.find((s: string) =>
      s.includes('CREATE TABLE "saved_items"'),
    );
    expect(savedItems).toBeDefined();
    expect(savedItems).toContain('"user_id" uuid');
    expect(savedItems).toContain('"item_type"');
    expect(savedItems).toContain('"item_id" character varying');
    expect(savedItems).toContain('"created_at" TIMESTAMP WITH TIME ZONE');
    expect(savedItems).toContain(
      'CONSTRAINT "UQ_saved_items_user_type_item" UNIQUE ("user_id", "item_type", "item_id")',
    );

    const enumStmt = statements.find((s: string) =>
      s.includes("CREATE TYPE"),
    );
    expect(enumStmt).toBeDefined();
    expect(enumStmt).toContain("'street'");
    expect(enumStmt).toContain("'postal'");

    const savedFk = statements.find(
      (s: string) =>
        s.includes('ALTER TABLE "saved_items"') &&
        s.includes('REFERENCES "users"("id")'),
    );
    expect(savedFk).toBeDefined();
    expect(savedFk).toContain('ON DELETE CASCADE');
  });

  it('seeds the 4 postals from the front catalog (p3/p5/p7/p9) idempotently', async () => {
    const { statements } = await runUp();

    const seed = statements.find((s: string) => s.includes('INSERT INTO "postals"'));
    expect(seed).toBeDefined();
    expect(seed).toContain('ON CONFLICT ("id") DO NOTHING');
    expect(seed).toContain("'p3'");
    expect(seed).toContain("'Postal Colección Nomenclador'");
    expect(seed).toContain('25000');
    expect(seed).toContain("'p5'");
    expect(seed).toContain("'Postal Calle del Arzobispado'");
    expect(seed).toContain('5000');
    expect(seed).toContain("'p7'");
    expect(seed).toContain("'Set Postales Monumentos'");
    expect(seed).toContain('18000');
    expect(seed).toContain("'p9'");
    expect(seed).toContain("'Postal Bastión de San Felipe'");
    expect(seed).toContain('5000');
  });

  it('drops the tables and enum in reverse order on down', async () => {
    const migration = new InitSchema1753000000000();
    const { queryRunner, query } = buildQueryRunner();
    await migration.down(queryRunner);
    const statements = (query as jest.Mock).mock.calls.map((call) => call[0]);

    expect(statements).toEqual(
      expect.arrayContaining([
        expect.stringContaining('DROP TABLE "saved_items"'),
        expect.stringContaining('DROP TABLE "likes"'),
        expect.stringContaining('DROP TABLE "postals"'),
        expect.stringContaining('DROP TABLE "users"'),
        expect.stringContaining('DROP TYPE'),
      ]),
    );
  });
});