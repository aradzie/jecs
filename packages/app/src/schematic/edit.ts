import { Instance } from "./instance.ts";
import { Note } from "./note.ts";

export type EditAction = SetText | SetProp;

export type SetText = {
  readonly type: "set-text";
  readonly note: Note;
  readonly text: string;
};

export type SetProp = {
  readonly type: "set-prop";
  readonly instance: Instance;
  readonly name: string;
  readonly value: string;
};
