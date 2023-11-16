import { UniqueEntityId } from '@shared/core/ValueObjects/UniqueEntityId';

export class Entity<T> {
  private ID: UniqueEntityId;

  protected PROPS: T;

  protected constructor(props: T, id?: UniqueEntityId) {
    this.PROPS = props;
    this.ID = id || new UniqueEntityId();
  }

  get id() {
    return this.ID;
  }

  equals(entity: Entity<T>) {
    if (entity === this) return true;
    if (this.ID.equals(entity.id)) return true;
    if (this.id.toString() === entity.ID.toString()) return true;
    return false;
  }
}
