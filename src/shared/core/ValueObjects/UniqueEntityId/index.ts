import { randomUUID } from 'crypto';

export class UniqueEntityId {
  private ID: string;

  constructor(id?: string) {
    if (!id) {
      const uuidSpliced = randomUUID().replaceAll('-', '');
      this.ID = uuidSpliced.slice(0, 15);
      return;
    }

    this.ID = id;
  }

  get id() {
    return this.ID;
  }

  toString() {
    return this.ID;
  }

  toValue() {
    return this.ID;
  }

  equals(id: UniqueEntityId) {
    if (id === this) return true;
    if (id.toString() === this.toString()) return true;
    return false;
  }
}
