const Finisher = artifacts.require("./Finisher.sol");

contract("Finisher", accounts => {
  it("should set medal price to 1", async () => {
    const finisher = await Finisher.deployed();

    // Set myString to "Hey there!"
    await finisher.setMedalCost(2, { from: accounts[0] });

    // Get myString from public variable getter
    const price = await finisher.getMedalCost({ from: accounts[0] });

    assert.equal(price, 2, "price was not set");
  });
});