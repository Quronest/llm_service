import { StreamFlag } from "../enums/streamFlag.enum";

export interface StreamStartEvent {
  flag: StreamFlag.START;
  data: {
    timestamp: string;
  };
}

export interface StreamChunkEvent {
  flag: StreamFlag.CHUNK;
  data: {
    content: string;
  };
}

export interface StreamMetadataEvent {
  flag: StreamFlag.METADATA;
  data: {
    title: string;
    summary: string;
  };
}

export interface StreamDoneEvent {
  flag: StreamFlag.DONE;
  data: null;
}

export interface StreamErrorEvent {
  flag: StreamFlag.ERROR;
  data: {
    error: string;
  };
}

export type AssistantStreamEvent =
  | StreamStartEvent
  | StreamChunkEvent
  | StreamMetadataEvent
  | StreamDoneEvent
  | StreamErrorEvent;
