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

    struct IdeaDTO {
      uint id;
      string title;
      string descriptionHash;
      address author;
      uint approvedCount;
      uint rejectedCount;
      VoteResult userVote;
      bool canChange;
      bool canVoteForIdea;
      uint createdOn;
    }

    mapping(uint => Idea) private ideas;
    uint private ideasCount = 0;
    mapping(uint => VotedIdea) private votes;
    uint private votingsCount = 0;

    event NewIdeaCreated(uint id);
    event IdeaTitleChanged(uint id, string newTitle);
    event IdeaDescriptionChanged(uint id, string newDescriptionHash);
    event IdeaDeleted(uint id);
    event UserVotePerformed(uint id, address userAddress, VoteResult userVote, uint voteDate);

    modifier onlyCanChangeIdea(uint ideaId) {
      require(canChangeIdea(ideaId), "Not enough permission to delete this idea");
      _;
    }

    modifier onlyCanVoteForIdea(uint ideaId) {
      require(canVoteForIdea(ideaId), "Can't vote for it's own idea");
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

    function editIdeaTitle(uint ideaId, string calldata newTitle) external onlyCanChangeIdea(ideaId) {
      Idea storage idea = ideas[ideaId];
      idea.title = newTitle;

      emit IdeaTitleChanged(ideaId, newTitle);
    }

    function editIdeaDescription(uint ideaId, string calldata newDescriptionHash) external onlyCanChangeIdea(ideaId) {
      Idea storage idea = ideas[ideaId];
      idea.descriptionHash = newDescriptionHash;

      emit IdeaDescriptionChanged(ideaId, newDescriptionHash);
    }

    function deleteIdea(uint ideaId) external onlyCanChangeIdea(ideaId) {        
      delete ideas[ideaId];

      for (uint voteId = 0; voteId < votingsCount; voteId++) {
        VotedIdea memory votedIdea = votes[voteId];
        if (votedIdea.ideaId == ideaId) {
          delete votes[voteId];
        }
      }

      emit IdeaDeleted(ideaId);
    }

    function canChangeIdea(uint ideaId) private view returns (bool) {
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

        allIdeas[ideaId] = IdeaDTO(
          idea.id,
          idea.title,
          idea.descriptionHash,
          idea.author,
          approvedCount,
          rejectedCount,
          userVoted,
          canChangeIdea(idea.id),
          canVoteForIdea(idea.id),
          idea.createdOn);
      }

      return allIdeas;
  }
}