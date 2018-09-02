export interface DomainEvent {

}

export type DomainEventConstructor<T extends DomainEvent> = new (...args: any[]) => T;
