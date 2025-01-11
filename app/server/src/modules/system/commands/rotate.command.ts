import { Command } from "shared/types/main.ts";
import { System } from "modules/system/main.ts";
import { FurnitureType, ProxyEvent } from "shared/enums/main.ts";
import { __ } from "shared/utils/main.ts";
import { CrossDirection } from "@oh/utils";

export const rotateCommand: Command = {
  command: "rotate",
  func: async ({ user, args }) => {
    const [id, clockwise] = args as [string, string];

    const roomId = user.getRoom();
    if (!roomId) return;

    const room = await System.game.rooms.get(roomId);
    const furniture = room
      .getFurnitures()
      .find((furniture) => furniture.id === id);

    if (!furniture) {
      user.emit(ProxyEvent.SYSTEM_MESSAGE, {
        message: __(user.getLanguage())("Furniture not found!"),
      });
      return;
    }

    const $furniture = await System.game.furniture.get(furniture.furnitureId);
    if (!$furniture) return;
    if ($furniture.type === FurnitureType.FRAME) return;

    const directions = Object.keys($furniture.direction).map(
      (direction) => CrossDirection[direction.toUpperCase()],
    );

    const $clockwise = clockwise === "true";
    let targetDirectionIndex = directions.indexOf(furniture.direction);
    if ($clockwise) {
      targetDirectionIndex++;
      if (targetDirectionIndex >= directions.length) targetDirectionIndex = 0;
    } else {
      targetDirectionIndex--;
      if (0 > targetDirectionIndex)
        targetDirectionIndex = directions.length - 1;
    }

    furniture.direction = directions[targetDirectionIndex];

    await room.updateFurniture(furniture);
    room.emit(ProxyEvent.UPDATE_FURNITURE, {
      furniture,
    });
  },
};