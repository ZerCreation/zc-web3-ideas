export interface IdeaComment {
  id: number;
  ideaId: number;
  descriptionHash: string;
  description: string;
  author: string;
  createdOn: number;
}