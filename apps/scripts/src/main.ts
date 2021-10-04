import { prisma } from './../../api/src/prismaClient';
import inquirer from 'inquirer'
import { Scripts } from './app/ScriptFactory'
import { BaseScript } from './app/scripts/BaseScript'


(async function run() {
  try {
    const answers = await inquirer.prompt([
      {
        name: "functionName",
        message: "Which function would you like to run>",
        type: 'list',
        choices: Scripts.map(script => ({ name: script.functionName, value: script }))
      }
    ])

    const script = (new answers.functionName) as BaseScript

    await script.run()

    process.exit(0)
  } catch (e) {
    prisma.$disconnect()
    console.error(e);
    process.exit(1)
  }
})()
