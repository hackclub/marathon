#!/usr/bin/env node

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

async function showQuestion(index, question, id, wrong) {
  await figlet(
    `Stage ${index}`,
    {
      font: "ANSI Regular",
    },
    function (err, data) {
      if (err) {
        console.log(`Stage ${index}`);
      }
      console.log(wrong ? chalk.red(data) : chalk.blue(data));
    }
  );
  await sleep(200);
  console.log(
    "Append --pause to pause the marathon and type skip to skip the question (will add 5 minutes to your time) \n"
  );
  await sleep(300);
  const { answer } = await inquirer
    .prompt([
      {
        type: "input",
        name: "answer",
        message: (wrong ? "Wrong! Try again. " : "") + question,
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
  blankScreen();
  await figlet(
    `Checking`,
    {
      font: "ANSI Regular",
    },
    function (err, data) {
      if (err) {
        console.log(`Checking`);
      }
      console.log(chalk.cyan(data));
    }
  );
  let checkResponse = await fetch(
    `https://marathon-api.hackclub.dev/question?id=${id}&answer=${answer.replace(
      "--pause"
    )}${answer.includes("--pause") ? "&pause=true" : ""}${
      answer.replace("--pause", "").trim() == "skip" ? "&skip=true" : ""
    }`
  ).then((r) => r.json());
  blankScreen();
  if (checkResponse.complete) {
    await figlet(
      `YOU'VE`,
      {
        font: "ANSI Regular",
      },
      function (err, data) {
        if (err) {
          console.log(`You've`);
        }
        console.log(chalk.green(data));
      }
    );
    await figlet(
      `DONE IT!`,
      {
        font: "ANSI Regular",
      },
      function (err, data) {
        if (err) {
          console.log(`Done It!`);
        }
        console.log(chalk.green(data));
      }
    );
    console.log(
      chalk.green(
        `The marathon was completed in ${checkResponse.seconds} seconds.`
      )
    );
    return;
  }
  if (checkResponse.correct && checkResponse.paused) {
    console.log(chalk.green(`You got it! I've paused the marathon for you.`));
    return;
  }
  if (checkResponse.correct) {
    await showQuestion(checkResponse.index, checkResponse.question, id);
  } else {
    await showQuestion(index, question, id, true);
  }
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
  if (startResponse.complete) {
    console.log(
      chalk.green(
        "\nHey " +
          startResponse.user["Participant Name"] +
          "! You've already completed the marathon, nice work!\n"
      )
    );
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
  await showQuestion(startResponse.index, startResponse.question, id);
}

main();
