const Web3Ideas = artifacts.require("Web3Ideas");

contract("Web3Ideas", (accounts) => {
  let web3IdeasInstance;

  beforeEach('should setup the contract instance', async () => {
    web3IdeasInstance = await Web3Ideas.new();
  });

  describe("Create ideas", () => {
    it("should create 2 ideas", async () => {
      // When
      await web3IdeasInstance.createIdea('title 1', 'descHash 1');
      await web3IdeasInstance.createIdea('title 2', 'descHash 2');
      
      // Then
      const ideas = await web3IdeasInstance.getAllIdeas.call();
      assert.equal(ideas.length, 2, "Wrong ideas number");
    });
    
    it("should create idea with correct data", async () => {
      // When
      await web3IdeasInstance.createIdea('title', 'descHash');
      
      // Then
      const ideas = await web3IdeasInstance.getAllIdeas.call();
      assert.equal(ideas[0].title, 'title', "Wrong title");
      assert.equal(ideas[0].descriptionHash, 'descHash', "Wrong description");
    });
  });

  describe("Delete idea", () => {
    it("should delete idea", async () => {
      // Given
      await web3IdeasInstance.createIdea('title 1', 'descHash 1', {from: accounts[1]});

      // When
      await web3IdeasInstance.deleteIdea(0, {from: accounts[1]});

      // Then
      const ideas = await web3IdeasInstance.getAllIdeas.call();
      assert.equal(ideas.length, 0, "Wrong ideas number");
    });

    it("should not delete other user idea", async () => {
      // Given
      await web3IdeasInstance.createIdea('title 1', 'descHash 1', {from: accounts[1]});

      try {
        // When
        await web3IdeasInstance.deleteIdea(0, {from: accounts[2]});
        assert.equal(true, false, "Failed");
      } catch(error) {
        // Then
        assert.equal(true, true, "Ok");
      }

      // Then
      const ideas = await web3IdeasInstance.getAllIdeas.call();
      assert.equal(ideas.length, 1, "Wrong ideas number");
    });

    it("user admin should delete other user idea", async () => {
      // Given
      await web3IdeasInstance.createIdea('title 1', 'descHash 1', {from: accounts[1]});

      // When
      await web3IdeasInstance.deleteIdea(0, {from: accounts[0]});

      // Then
      const ideas = await web3IdeasInstance.getAllIdeas.call();
      assert.equal(ideas.length, 0, "Wrong ideas number");
    });
  });

  describe("Add comment", () => {
    it("should add comment", async () => {
      // Given
      await web3IdeasInstance.createIdea('title 1', 'descHash 1');
      
      // When
      await web3IdeasInstance.addComment(0, 'descHash comment 1');

      // Then
      const ideas = await web3IdeasInstance.getAllIdeas.call();
      assert.equal(ideas[0].comments[0].descriptionHash, 'descHash comment 1', "Wrong comment's description");
    });
  });

  describe("Delete comment", () => {
    it("should delete comment", async () => {
      // Given
      await web3IdeasInstance.createIdea('title 1', 'descHash 1');
      await web3IdeasInstance.addComment(0, 'descHash comment 1', {from: accounts[1]});
      
      // When
      await web3IdeasInstance.deleteComment(0, {from: accounts[1]});

      // Then
      const ideas = await web3IdeasInstance.getAllIdeas.call();
      assert.equal(ideas[0].comments.length, 0, "Wrong comments number");
    });

    it("user admin should delete other user comment", async () => {
      // Given
      await web3IdeasInstance.createIdea('title 1', 'descHash 1');
      await web3IdeasInstance.addComment(0, 'descHash comment 1', {from: accounts[1]});
      
      // When
      await web3IdeasInstance.deleteComment(0, {from: accounts[0]});

      // Then
      const ideas = await web3IdeasInstance.getAllIdeas.call();
      assert.equal(ideas[0].comments.length, 0, "Wrong comments number");
    });
  });

  describe("Voting", () => {
    it("should vote for other user idea", async () => {
      // Given
      await web3IdeasInstance.createIdea('title 1', 'descHash 1', {from: accounts[1]});
      
      // When
      await web3IdeasInstance.voteForIdea(0, 1, {from: accounts[2]});

      // Then
      const ideas = await web3IdeasInstance.getAllIdeas.call();
      assert.equal(ideas[0].approvedCount, 1, "Wrong vote result");
    });

    it("should vote against other user idea", async () => {
      // Given
      await web3IdeasInstance.createIdea('title 1', 'descHash 1', {from: accounts[1]});
      
      // When
      await web3IdeasInstance.voteForIdea(0, 2, {from: accounts[2]});

      // Then
      const ideas = await web3IdeasInstance.getAllIdeas.call();
      assert.equal(ideas[0].rejectedCount, 1, "Wrong vote result");
    });

    it("should not allow to vote for user idea even by admin", async () => {
      // Given
      await web3IdeasInstance.createIdea('title 1', 'descHash 1', {from: accounts[0]});
      
      try {
        // When
        await web3IdeasInstance.voteForIdea(0, 1, {from: accounts[0]});
        assert.equal(true, false, "Failed");
      } catch(error) {
        // Then
        assert.equal(true, true, "Ok");
      }
    });

    it("should not allow to vote for user idea", async () => {
      // Given
      await web3IdeasInstance.createIdea('title 1', 'descHash 1', {from: accounts[1]});
      
      try {
        // When
        await web3IdeasInstance.voteForIdea(0, 1, {from: accounts[1]});
        assert.equal(true, false, "Failed");
      } catch(error) {
        // Then
        assert.equal(true, true, "Ok");
      }
    });

    it("should show user vote for idea", async () => {
      // Given
      await web3IdeasInstance.createIdea('title 1', 'descHash 1', {from: accounts[0]});
      await web3IdeasInstance.voteForIdea(0, 1, {from: accounts[1]});
      
      // When
      const ideas = await web3IdeasInstance.getAllIdeas.call({from: accounts[1]});

      // Then
      assert.equal(ideas[0].userVote, 1, "Wrong vote result");
    });

    it("should show user vote against idea", async () => {
      // Given
      await web3IdeasInstance.createIdea('title 1', 'descHash 1', {from: accounts[0]});
      await web3IdeasInstance.voteForIdea(0, 2, {from: accounts[1]});
      
      // When
      const ideas = await web3IdeasInstance.getAllIdeas.call({from: accounts[1]});

      // Then
      assert.equal(ideas[0].userVote, 2, "Wrong vote result");
    });
  });
});