export interface DomainEvent {

}

export type DomainEventConstructor<T extends DomainEvent = DomainEvent> = new (...args: any[]) => T;
