export interface Notification {
  _id: string;
  recipient: Recipient;
  actor: Recipient;
  type: string;
  entityType: string;
  entityId: string;
  isRead: boolean;
  createdAt: string;
  entity: Entity;
}
interface Entity {
  _id: string;
  name: string;
  body: string;
  user: string;
  commentsCount: number;
  topComment: TopComment;
  sharesCount: number;
  likesCount: number;
  isShare: boolean;
  id: string;
}
interface TopComment {
  _id: string;
  content: string;
  commentCreator: CommentCreator;
  post: string;
  parentComment: null;
  likes: any[];
  createdAt: string;
}
interface CommentCreator {
  _id: string;
  name: string;
  username: string;
  photo: string;
}
interface Recipient {
  _id: string;
  name: string;
  photo: string;
}
