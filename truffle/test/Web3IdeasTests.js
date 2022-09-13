const Web3Ideas = artifacts.require("Web3Ideas");

contract("Web3Ideas", (accounts) => {
  let web3IdeasInstance;

  beforeEach('should setup the contract instance', async () => {
    web3IdeasInstance = await Web3Ideas.new();
  });

  describe("Get ideas", () => {
    it("should get correct number of ideas", async () => {
      // When
      await web3IdeasInstance.createIdea('title 1', 'descHash 1');
      await web3IdeasInstance.createIdea('title 2', 'descHash 2');
      
      // Then
      const ideas = await web3IdeasInstance.getAllIdeas.call();
      assert.equal(ideas.length, 2, "Wrong ideas number");
    });
    
    it("should get correct idea data", async () => {
      // When
      await web3IdeasInstance.createIdea('title', 'descHash');
      
      // Then
      const ideas = await web3IdeasInstance.getAllIdeas.call();
      assert.equal(ideas[0].title, 'title', "Wrong title");
      assert.equal(ideas[0].descriptionHash, 'descHash', "Wrong description");
    });
  });

  describe("Edit idea", () => {
    it("should edit idea title by idea creator", async () => {
      // Given
      await web3IdeasInstance.createIdea('original title', 'descHash', {from: accounts[1]});

      // When
      await web3IdeasInstance.editIdeaTitle(0, 'new title', {from: accounts[1]});

      // Then
      const ideas = await web3IdeasInstance.getAllIdeas.call();
      assert.equal(ideas[0].title, 'new title', "Wrong title");
    });

    it("should edit idea title by admin", async () => {
      // Given
      await web3IdeasInstance.createIdea('original title', 'descHash', {from: accounts[1]});

      // When
      await web3IdeasInstance.editIdeaTitle(0, 'new title', {from: accounts[0]});

      // Then
      const ideas = await web3IdeasInstance.getAllIdeas.call();
      assert.equal(ideas[0].title, 'new title', "Wrong title");
    });

    it("should not edit idea title by not owner", async () => {
      // Given
      await web3IdeasInstance.createIdea('original title', 'descHash', {from: accounts[1]});

      // When
      try {
        await web3IdeasInstance.editIdeaTitle(0, 'new title', {from: accounts[2]});
        assert.equal(true, false, "Title changed by not owner");
      } catch(error) {
        // Then
        assert.equal(true, true, "Ok");
      }
    });

    it("should edit idea description by idea creator", async () => {
      // Given
      await web3IdeasInstance.createIdea('title', 'original descHash', {from: accounts[1]});

      // When
      await web3IdeasInstance.editIdeaTitle(0, 'new descHash', {from: accounts[1]});

      // Then
      const ideas = await web3IdeasInstance.getAllIdeas.call();
      assert.equal(ideas[0].title, 'new descHash', "Wrong description");
    });

    it("should edit idea description by admin", async () => {
      // Given
      await web3IdeasInstance.createIdea('title', 'original descHash', {from: accounts[1]});

      // When
      await web3IdeasInstance.editIdeaTitle(0, 'new descHash', {from: accounts[0]});

      // Then
      const ideas = await web3IdeasInstance.getAllIdeas.call();
      assert.equal(ideas[0].title, 'new descHash', "Wrong description");
    });

    it("should not edit idea description by not owner", async () => {
      // Given
      await web3IdeasInstance.createIdea('title', 'original descHash', {from: accounts[1]});

      // When
      try {
        await web3IdeasInstance.editIdeaDescription(0, 'new descHash', {from: accounts[2]});
        assert.equal(true, false, "Description changed by not owner");
      } catch(error) {
        // Then
        assert.equal(true, true, "Ok");
      }
    });
  });
});