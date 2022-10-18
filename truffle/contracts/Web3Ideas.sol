// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Web3Ideas is AccessControl {
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");

    struct Idea {
      uint id;
      string title;
      string descriptionHash;
      address author;
      uint createdOn;
    }

    struct VotedIdea {
      uint ideaId;
      address voter;
      VoteResult result;
    }

    enum VoteResult {
      Pending,
      Approved,
      Rejected
    }

    struct IdeaComment {
      uint id;
      uint ideaId;
      string descriptionHash;
      address author;
      uint createdOn;
      bool canDelete;
    }

    struct IdeaDTO {
      uint id;
      string title;
      string descriptionHash;
      address author;
      uint approvedCount;
      uint rejectedCount;
      VoteResult userVote;
      bool canDelete;
      bool canVoteForIdea;
      uint createdOn;
      IdeaComment[] comments;
    }

    mapping(uint => Idea) private ideas;
    uint private ideasCount = 0;
    mapping(uint => VotedIdea) private votes;
    uint private votingsCount = 0;
    mapping(uint => IdeaComment) private comments;
    uint private commentsCount = 0;

    event NewIdeaCreated(uint id);
    event IdeaTitleChanged(uint id, string newTitle);
    event IdeaDescriptionChanged(uint id, string newDescriptionHash);
    event IdeaDeleted(uint id);
    event UserVotePerformed(uint id, address userAddress, VoteResult userVote, uint voteDate);
    event CommentAdded(uint id, string descriptionHash);
    event CommentDeleted(uint id);

    modifier onlyCanDeleteIdea(uint ideaId) {
      require(canDeleteIdea(ideaId), "Not enough permission to delete this idea");
      _;
    }

    modifier onlyCanVoteForIdea(uint ideaId) {
      require(canVoteForIdea(ideaId), "Can't vote for it's own idea");
      _;
    }

    modifier onlyCanDeleteComment(uint commentId) {
      require(canDeleteComment(commentId), "Not enough permission to delete this comment");
      _;
    }

    constructor() {
      _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function createIdea(string calldata title, string calldata descriptionHash) external {
      require(msg.sender != address(0), "Fake user address");
      Idea memory newIdea = Idea(ideasCount, title, descriptionHash, msg.sender, block.timestamp);
      ideas[ideasCount] = newIdea;
      ++ideasCount;

      emit NewIdeaCreated(ideasCount);
    }

    function deleteIdea(uint ideaId) external onlyCanDeleteIdea(ideaId) {        
      delete ideas[ideaId];
      --ideasCount;

      for (uint voteId = 0; voteId < votingsCount; voteId++) {
        VotedIdea memory votedIdea = votes[voteId];
        if (votedIdea.ideaId == ideaId) {
          delete votes[voteId];
        }
      }

      emit IdeaDeleted(ideaId);
    }

    function canDeleteIdea(uint ideaId) private view returns (bool) {
      return ideas[ideaId].author == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function voteForIdea(uint ideaId, VoteResult voteResult) external onlyCanVoteForIdea(ideaId) {
      require(msg.sender != address(0), "Fake user address");
      for (uint256 voteId = 0; voteId < votingsCount; voteId++) {
        if (votes[voteId].ideaId == ideaId && votes[voteId].voter == msg.sender) {
          // change vote's decission
          require (votes[voteId].result != voteResult, "Redundant voting makes no sense");
          votes[voteId].result = voteResult;
          emit UserVotePerformed(ideaId, msg.sender, voteResult, block.timestamp);
          return;
        }
      }

      // add new vote
      VotedIdea memory votedIdea = VotedIdea(ideaId, msg.sender, voteResult);
      votes[votingsCount] = votedIdea;
      ++votingsCount;

      emit UserVotePerformed(ideaId, msg.sender, voteResult, block.timestamp);
    }

    function canVoteForIdea(uint ideaId) private view returns (bool) {
      return msg.sender != ideas[ideaId].author;
    }

    function canDeleteComment(uint commentId) private view returns (bool) {
      return comments[commentId].author == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function addComment(uint ideaId, string calldata descriptionHash) external {
      IdeaComment memory comment = IdeaComment(
        commentsCount, ideaId, descriptionHash, msg.sender, block.timestamp, false);
      comments[commentsCount] = comment;
      ++commentsCount;

      emit CommentAdded(ideaId, descriptionHash);
    }

    function deleteComment(uint commentId) external onlyCanDeleteComment(commentId) {
      delete comments[commentId];
      --commentsCount;
      
      emit CommentDeleted(commentId);
    }

    function getAllIdeas() external view returns(IdeaDTO[] memory) {
      IdeaDTO[] memory allIdeas = new IdeaDTO[](ideasCount);
      for (uint ideaId = 0; ideaId < ideasCount; ideaId++) {
        Idea memory idea = ideas[ideaId];
        uint approvedCount;
        uint rejectedCount;
        VoteResult userVoted;
        for (uint voteId = 0; voteId < votingsCount; voteId++) {
          if (votes[voteId].voter == msg.sender && votes[voteId].ideaId == idea.id) {
              userVoted = votes[voteId].result;
          }
          if (votes[voteId].ideaId != idea.id) {
              continue;
          }
          if (votes[voteId].result == VoteResult.Approved) {
              ++approvedCount;
          } else {
              ++rejectedCount;
          }
        }

        IdeaComment[] memory ideaComments = new IdeaComment[](commentsCount);
        uint ideaCommentId = 0;
        for (uint commentId = 0; commentId < commentsCount; commentId++) {
          IdeaComment memory comment = comments[commentId];
          if (comment.ideaId != idea.id) {
              continue;
          }
          comment.canDelete = canDeleteComment(comment.id);
          ideaComments[ideaCommentId] = comment;
          ++ideaCommentId;
        }

        allIdeas[ideaId] = IdeaDTO(
          idea.id,
          idea.title,
          idea.descriptionHash,
          idea.author,
          approvedCount,
          rejectedCount,
          userVoted,
          canDeleteIdea(idea.id),
          canVoteForIdea(idea.id),
          idea.createdOn,
          ideaComments);
      }

      return allIdeas;
  }
}