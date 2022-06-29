import {MessageStatus} from '../types/message/status';

export interface IMessage {
  adminSideMessageId: string | number | null;
  clientChatId:  string | number;
  clientSideMessageId: string | number;
  date: Date;
  status: MessageStatus;
}