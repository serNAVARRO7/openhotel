import { RoomFurniture, User } from "shared/types/main.ts";
import { ProxyEvent, RoomPointEnum } from "shared/enums/main.ts";
import { Point3d, Direction } from "@oh/utils";

type BaseRoom = {
  version: 1;
  id: string;
  title: string;
  description: string;
  ownerId: string;
};

export type RawRoom = BaseRoom & {
  layout: string[];
  furniture: RoomFurniture[];
};

export type Room = BaseRoom & {
  layout: RoomPoint[][];
  furniture: RoomFurniture[];
  spawnPoint: Point3d;
  spawnDirection: Direction;
};

export type RoomPoint = number | string | RoomPointEnum;

export type FindPathProps = {
  start: Point3d;
  end: Point3d;
  accountId?: string;
};

export type RoomMutable = {
  getId: () => string;
  getTitle: () => string;
  getDescription: () => string;

  getOwnerId: () => string;
  getOwnerUsername: () => Promise<string | null>;

  addUser: (user: User, position?: Point3d) => Promise<void>;
  removeUser: (user: User, moveToAnotherRoom?: boolean) => void;
  getUsers: () => string[];

  getPoint: (point: Point3d) => RoomPoint;
  isPointFree: (point: Point3d, accountId?: string) => boolean;
  findPath: (props: FindPathProps) => Point3d[];

  addFurniture: (furniture: RoomFurniture) => Promise<void>;
  updateFurniture: (furniture: RoomFurniture) => Promise<void>;
  removeFurniture: (furniture: RoomFurniture) => Promise<void>;
  getFurnitures: () => RoomFurniture[];

  getObject: () => Room;

  emit: <Data extends any>(event: ProxyEvent, data?: Data) => void;
};
