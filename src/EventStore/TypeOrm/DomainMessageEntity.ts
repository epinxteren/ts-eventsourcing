import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DomainMessageEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  public readonly id?: number;

  constructor(
    @Column({ type: 'text' })
    public readonly aggregateId: string,
    @Column({ type: 'text' })
    public readonly serializedAggregateId: string,
    @Column({ type: 'text' })
    public readonly eventName: string,
    @Column({ type: 'int' })
    public readonly playhead: number,
    @Column({ type: 'longtext' })
    public readonly payload: string,
    @Column({ type: 'bigint' })
    public readonly recordedOn: number,
    @Column({ type: 'longtext' })
    public readonly metadata: string,
  ) {

  }

}
