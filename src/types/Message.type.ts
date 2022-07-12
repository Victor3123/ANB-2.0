import {MessageStatus} from './message/status';

export interface Message {
  adminSideMessageId: string | number | null;
  clientChatId:  string | number;
  clientSideMessageId: string | number;
  date: Date;
  status: MessageStatus;
}
