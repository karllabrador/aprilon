export type Forum = {
  id: number;
  parentId: number | null;
  name: string;
  description: string | null;
  topicCount: number;
  postCount: number;
};

export type Topic = {
  id: number;
  forumId: number;
  title: string;
  authorId: number | null;
  lastPosterId: number | null;
  postCount: number;
  participantCount: number;
  createdAt: number;
  lastPostAt: number;
  isSticky: boolean;
  isLocked: boolean;
  lockedById: number | null;
  lockedAt: number | null;
};

export type Post = {
  id: number;
  topicId: number;
  authorId: number | null;
  contentHtml: string;
  createdAt: number;
};
