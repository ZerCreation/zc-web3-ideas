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

    mapping(uint => Idea) private ideas;
    uint private ideasCount = 0;

    event NewIdeaCreated(uint id);
    event IdeaTitleChanged(uint id, string newTitle);
    event IdeaDescriptionChanged(uint id, string newDescriptionHash);

    modifier onlyCanChangeIdea(uint ideaId) {
      require(canChangeIdea(ideaId), "Not enough permission to delete this idea");
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

    function canChangeIdea(uint ideaId) private view returns (bool) {
      return ideas[ideaId].author == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function getAllIdeas() external view returns(Idea[] memory) {
      Idea[] memory allIdeas = new Idea[](ideasCount);
      for (uint ideaId = 0; ideaId < ideasCount; ideaId++) {
        Idea memory idea = ideas[ideaId];
        allIdeas[ideaId] = idea;
      }

      return allIdeas;
  }
}