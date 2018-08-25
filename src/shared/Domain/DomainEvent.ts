export interface DomainEvent {

}

export type DomainEventConstructor = new (...args: any[]) => DomainEvent;
