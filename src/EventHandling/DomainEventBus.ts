import { EventListener } from './EventListener';
import { DomainEventStream } from '../Domain/DomainEventStream';

/**
 * Publishes events to the subscribed event listeners.
 */
export interface DomainEventBus {
  /**
   * Subscribes the event listener to the event bus.
   */
  subscribe(eventListener: EventListener): void;

  /**
   * Publishes the events from the domain event stream to the listeners.
   */
  publish(domainMessages: DomainEventStream): void;
}
