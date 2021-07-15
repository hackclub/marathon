const readline = require("readline");
const gradient = require("gradient-string");
const chalk = require("chalk");
const inquirer = require("inquirer");
const fetch = require("node-fetch");
const figlet = require("figlet");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function blankScreen() {
  // Function that we'll use to show simply a blank screen
  readline.cursorTo(process.stdout, 0, 0); // Moves the user cursor to 0,0
  readline.clearScreenDown(process.stdout); // Clears the screen and make it blank
}

async function showQuestion(index) {
  await figlet(
    `Stage ${index}`,
    {
      font: "ANSI Regular",
    },
    function (err, data) {
      if (err) {
        console.log(`Stage ${index}`);
      }
      console.log(chalk.blue(data));
    }
  );
}

blankScreen();

async function main() {
  console.log(
    chalk.green(
      [
        "          /\\ ",
        "         /**\\ ",
        "        /****\\   /\\ ",
        "       /      \\ /**\\ ",
        "      /  /\\    /    \\        /\\    /\\  /\\      /\\            /\\/\\/\\  /\\ ",
        "     /  /  \\  /      \\      /  \\/\\/  \\/  \\  /\\/  \\/\\  /\\  /\\/ / /  \\/  \\ ",
        "    /  /    \\/ /\\     \\    /    \\ \\  /    \\/ /   /  \\/  \\/  \\  /    \\   \\ ",
        "   /  /      \\/  \\/\\   \\  /      \\    /   /    \\ ",
        "__/__/_______/___/__\\___\\__________________________________________________",
      ].join("\n")
    )
  );

  console.log(
    chalk.green(
      `  
████████ ██   ██ ███████     ███    ███  █████  ██████   █████  ████████ ██   ██  ██████  ███    ██ 
   ██    ██   ██ ██          ████  ████ ██   ██ ██   ██ ██   ██    ██    ██   ██ ██    ██ ████   ██ 
   ██    ███████ █████       ██ ████ ██ ███████ ██████  ███████    ██    ███████ ██    ██ ██ ██  ██ 
   ██    ██   ██ ██          ██  ██  ██ ██   ██ ██   ██ ██   ██    ██    ██   ██ ██    ██ ██  ██ ██ 
   ██    ██   ██ ███████     ██      ██ ██   ██ ██   ██ ██   ██    ██    ██   ██  ██████  ██   ████ 
`
    )
  );
  const { id } = await inquirer
    .prompt([
      {
        type: "input",
        name: "id",
        message: "What is your participant ID (provided by email)?",
      },
    ])
    .then((answers) => {
      return answers;
    })
    .catch((error) => {
      if (error.isTtyError) {
        console.log(
          "This terminal does not support this tool, please try another"
        );
        throw error;
      } else {
        console.log("Error!");
        throw error;
      }
    });
  let startResponse = await fetch(
    `https://marathon-api.hackclub.dev/start?id=${id}`
  ).then((r) => r.json());
  if (startResponse.error) {
    console.log(chalk.red("\nError! " + startResponse.error + "\n"));
    return;
  }
  if (startResponse.starting) {
    console.log(
      chalk.blue(
        "\nHey " +
          startResponse.user["Participant Name"] +
          "! Loading the first stage for you...\n"
      )
    );
  }
  await sleep(2000);
  blankScreen();
  console.log(startResponse)
  await showQuestion(startResponse.index);
}

main();
