/** Generic building blocks composed into every feature's domain models. */

export type ID = string;

export interface Identifiable {
  id: ID;
}

export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}
