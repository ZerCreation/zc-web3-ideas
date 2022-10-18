import { IdeaComment } from "./IdeaComment";
import { VoteResult } from "./VoteResult";

export interface Idea {
  id: number;
  title: string;
  author: string;
  descriptionHash: string;
  description: string;
  approvedCount: number;
  rejectedCount: number;
  userVote: VoteResult;
  canDelete: boolean;
  canVoteForIdea: boolean;
  createdOn: number;
  comments: IdeaComment[];
}
