import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { UniqueEntityId } from '@shared/core/ValueObjects/UniqueEntityId';

export interface TaskProps {
  chunkSize: number;
  fileUri: string;
  fileSize: number;
  fileName: string;
  isFinished: boolean;
  parts: {
    validationHash: string;
    ord: number;
    completed: boolean;
  }[];
}

export class Task extends AggregateRoot<TaskProps> {
  static create(props: TaskProps, id?: UniqueEntityId) {
    return new Task(props, id);
  }

  get chunkSize() {
    return this.PROPS.chunkSize;
  }

  get fileUri() {
    return this.PROPS.fileUri;
  }

  get fileSize() {
    return this.PROPS.fileSize;
  }

  set fileSize(fileSize: number) {
    this.PROPS.fileSize = fileSize;
  }

  get fileName() {
    return this.PROPS.fileName;
  }

  get parts() {
    return this.PROPS.parts;
  }

  get isFinished() {
    return this.PROPS.isFinished;
  }

  set isFinished(isFinished: boolean) {
    this.PROPS.isFinished = isFinished;
  }
}
