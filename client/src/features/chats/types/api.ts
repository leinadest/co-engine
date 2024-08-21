export interface PartialUser {
  id: string;
  username: string;
  discriminator: string;
  profile_pic: string;
}

export interface MessageNode {
  id: string;
  creator: PartialUser[];
  formatted_created_at: string;
  formatted_edited_at?: string;
  content: string;
  reacts: Array<{ reactor_id: string; reaction: string }>;
}
