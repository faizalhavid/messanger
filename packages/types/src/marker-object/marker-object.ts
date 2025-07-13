import type { MarkObject } from '@prisma/client';

export enum MarkableTypeEnum {
  CONVERSATION,
  THREAD,
  FRIENDSHIP,
}

export interface MarkerObjectRequest {
  markableType: 'THREAD' | 'CONVERSATION' | 'FRIENDSHIP';
  userId: string;
  marker: string;
  markableId: string;
}

export interface MarkerObjectPublic<T> extends Omit<MarkObject, 'userId' | 'markableObjectId' | 'markableType'> {
  object: T;
}

export namespace MarkerObjectModelMapper {
  export function fromMarkerObjectToMarkerObjectPublic<T>(marker: MarkObject & { object?: T }): MarkerObjectPublic<T> {
    return {
      ...marker,
      object: {} as T,
    };
  }
}
