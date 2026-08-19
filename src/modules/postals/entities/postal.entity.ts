import { Column, Entity, PrimaryColumn, ValueTransformer } from 'typeorm';

/**
 * pg returns numeric columns as strings; the transformer keeps the API value
 * as a JS number (design D5).
 */
export function toNumber(
  value: string | null | undefined,
): number | null | undefined {
  if (value === null || value === undefined) return value;
  return Number(value);
}

class NumericTransformer implements ValueTransformer {
  to(value: number | null | undefined): number | null | undefined {
    return value;
  }

  from(value: string | null | undefined): number | null | undefined {
    return toNumber(value);
  }
}

@Entity('postals')
export class Postal {
  /** Natural id from the front catalog (p3/p5/p7/p9). */
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: new NumericTransformer(),
  })
  price: number;

  @Column()
  category: string;

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl: string | null;
}
