const { run } = require("hardhat");

async function verify(contractAdress, args) {
  console.log("Verifying contracts");

  try {
    // HH task
    await run("verify:verify", {
      address: contractAdress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("already verified");
    } else {
      console.log(e);
    }
  }
}

module.exports = { verify };
