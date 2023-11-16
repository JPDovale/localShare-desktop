import { UniqueEntityId } from '@shared/core/ValueObjects/UniqueEntityId';

export interface DomainEvent {
  ocurredAt: Date;
  getAggregateId(): UniqueEntityId;
}
