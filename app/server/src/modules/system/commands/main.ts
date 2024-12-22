import { parseArgs } from "deno/cli/parse_args.ts";
import { UserMutable } from "shared/types/user.types.ts";
import { log } from "shared/utils/log.utils.ts";
import { System } from "modules/system/main.ts";

import { stopCommand } from "./stop.command.ts";
import { opCommand } from "./op.command.ts";
import { deopCommand } from "./deop.command.ts";
import { banCommand } from "./ban.command.ts";
import { unbanCommand } from "./unban.command.ts";
import { blacklistCommand } from "./blacklist.command.ts";
import { whitelistCommand } from "./whitelist.command.ts";
import { kickCommand } from "./kick.command.ts";
import { updateCommand } from "./update.command.ts";
import { tpCommand } from "./tp.command.ts";
import { setCommand } from "./set.command.ts";
import { helpCommand } from "./help.command.ts";
import { unsetCommand } from "./unset.command.ts";
import { teleportCommand } from "./teleport.command.ts";
import { clearCommand } from "./clear.command.ts";

export const commandList = [
  stopCommand,

  opCommand,
  deopCommand,

  banCommand,
  unbanCommand,

  blacklistCommand,
  whitelistCommand,

  kickCommand,
  updateCommand,

  tpCommand,

  setCommand,
  unsetCommand,

  helpCommand,

  teleportCommand,

  clearCommand,
];

const roomGuest = () => true;
const roomOwner = async (user: UserMutable) => {
  if (await op(user)) return true;
  const roomId = user.getRoom();
  if (!roomId) return false;
  const room = await System.game.rooms.get(roomId);
  if (!room) return false;
  return room.getOwnerId() === user.getAccountId();
};
const op = async (user: UserMutable) => await user.isOp();

export const executeCommand = async ({
  message,
  user,
}: {
  message: string;
  user: UserMutable;
}) => {
  if (!message.startsWith("/")) return false;

  const { _ } = parseArgs(message.substring(1, message.length).split(" "));

  const foundCommand = commandList.find(({ command }) => _[0] === command);
  if (!foundCommand) return true;

  const role = {
    roomGuest,
    roomOwner,
    op,
  }[foundCommand.role];
  if (!(await role(user))) return true;

  log(`Command /${foundCommand.command} executed by ${user.getUsername()}!`);
  _.shift();
  try {
    foundCommand.func({ user, args: _ } as any);
  } catch (e) {
    console.error(`Something went wrong with command ${message}`);
  }

  return true;
};
