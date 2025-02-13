import { Align } from "../symbol/align.ts";
import { Dir } from "../symbol/direction.ts";
import { Instance } from "./instance.ts";
import { Note } from "./note.ts";

export type EditAction =
  | SetNoteText
  | SetNoteAlign
  | SetNoteDir
  | SetInstanceName
  | SetInstanceProp;

export type SetNoteText = {
  readonly type: "set-note-text";
  readonly note: Note;
  readonly text: string;
};

export type SetNoteAlign = {
  readonly type: "set-note-align";
  readonly note: Note;
  readonly align: Align;
};

export type SetNoteDir = {
  readonly type: "set-note-dir";
  readonly note: Note;
  readonly dir: Dir;
};

export type SetInstanceName = {
  readonly type: "set-instance-name";
  readonly instance: Instance;
  readonly name: string;
};

export type SetInstanceProp = {
  readonly type: "set-instance-prop";
  readonly instance: Instance;
  readonly name: string;
  readonly value: string;
};
