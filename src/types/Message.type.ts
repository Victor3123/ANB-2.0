import {MessageStatus} from './message/status';

export interface Message {
  adminSideMessageId: number[] | null;
  clientChatId:  number;
  clientSideMessageId: number;
  date: Date;
  status: MessageStatus;
}
