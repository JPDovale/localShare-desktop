import { DomainEvent } from '@shared/core/Events/DomainEvent';
import { DomainEvents } from '@shared/core/Events/DomainEvents';
import { Entity } from '../Entity';

export abstract class AggregateRoot<Props> extends Entity<Props> {
  private DOMAIN_EVENTS: DomainEvent[] = [];

  get domainEvents() {
    return this.DOMAIN_EVENTS;
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    this.DOMAIN_EVENTS.push(domainEvent);
    DomainEvents.markAggregateForDispatch(this);
  }

  public clearEvents() {
    this.DOMAIN_EVENTS = [];
  }
}
