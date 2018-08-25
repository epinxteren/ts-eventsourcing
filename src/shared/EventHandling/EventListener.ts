/**
 * Handles dispatched events.
 */

export interface EventListener
{

}

export interface EventListenerConstructor {
  new (...args: any[]): EventListener;
}
