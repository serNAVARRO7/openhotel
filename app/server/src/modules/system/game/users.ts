import {
  CacheUser,
  PrivateUser,
  User,
  UserMutable,
  UsersConfig,
} from "shared/types/main.ts";
import { System } from "modules/system/main.ts";
import { ProxyEvent } from "shared/enums/event.enum.ts";
import { MOVEMENT_BETWEEN_TILES_DURATION } from "shared/consts/tiles.consts.ts";
import { Language } from "shared/enums/languages.enum.ts";
import { RoomPointEnum } from "shared/enums/room.enums.ts";
import { USERS_CONFIG_DEFAULT } from "shared/consts/users.consts.ts";
import { TickerQueue } from "@oh/queue";
import { Direction, getDirection, getConfig, Point3d } from "@oh/utils";
import { exists } from "deno/fs/mod.ts";
import { log as $log } from "shared/utils/log.utils.ts";
import { UserAction } from "shared/enums/user.enums.ts";

export const users = () => {
  let $privateUserMap: Record<string, PrivateUser> = {};
  let $userMap: Record<string, UserMutable> = {};

  let $userPathfindingMap: Record<string, Point3d[]> = {};
  let $userLastMessageMap: Record<string, string> = {};
  let $userLastWhisperMap: Record<string, string> = {};

  const load = async () => {
    System.tasks.add({
      type: TickerQueue.REPEAT,
      repeatEvery: MOVEMENT_BETWEEN_TILES_DURATION,
      onFunc: async () => {
        for (const accountId of Object.keys($userPathfindingMap)) {
          const user = get({ accountId });
          const room = await System.game.rooms.get(user.getRoom());

          let nextPosition = $userPathfindingMap[accountId].shift();
          if (!nextPosition) return;
          const targetPosition =
            $userPathfindingMap[accountId][
              $userPathfindingMap[accountId].length - 1
            ];

          //check if next position is spawn, exit <<
          if (room.getPoint(nextPosition) === RoomPointEnum.SPAWN) {
            room.removeUser(user.getObject());
            return;
          }

          //check if targetPosition exists and if it's not free
          if (
            targetPosition &&
            !room?.isPointFree(nextPosition, user.getAccountId())
          ) {
            //calc new pathfinding
            const pathfinding = room?.findPath({
              start: user.getPosition(),
              end: targetPosition,
              accountId: user.getAccountId(),
            });

            //Path is not possible
            if (!pathfinding.length) {
              //if target position is spawn, exit <<
              if (room.getPoint(targetPosition) === RoomPointEnum.SPAWN) {
                room.removeUser(user.getObject());
                return;
              }

              delete $userPathfindingMap[accountId];
              return;
            }

            //set new pathfinding and next position
            $userPathfindingMap[accountId] = pathfinding;
            nextPosition = $userPathfindingMap[accountId].shift();
          }

          //check if next position is free
          if (!room.isPointFree(nextPosition, user.getAccountId())) {
            delete $userPathfindingMap[accountId];
            return;
          }

          const targetBodyDirection = getDirection(
            user.getPosition(),
            nextPosition,
          );
          //set next position (reserve it)
          user.setPosition(nextPosition);
          user.setBodyDirection(targetBodyDirection);
          room.emit(ProxyEvent.MOVE_HUMAN, {
            accountId: user.getAccountId(),
            position: nextPosition,
            bodyDirection: targetBodyDirection,
          });

          //check if there's no more pathfinding
          if (!targetPosition) delete $userPathfindingMap[accountId];
        }
      },
    });

    // Check config file
    const config = await exists("./users.yml");
    if (!config) {
      await setConfig({
        op: {
          users: [],
        },
        blacklist: {
          active: false,
          users: [],
        },
        whitelist: {
          active: false,
          users: [],
        },
      });
    }
  };

  const $getUser = (user: User): UserMutable => {
    if (!user) return null;
    let $user: User = { ...user };

    let $userAction: UserAction | null = null;

    const getAccountId = () => user.accountId;
    const getUsername = () => user.username;

    const setPosition = (position: Point3d) => {
      $user.position = position;
      $user.positionUpdatedAt = performance.now();
    };
    const getPosition = (): Point3d => $user?.position;
    const getPositionUpdatedAt = (): number => $user.positionUpdatedAt;

    const setBodyDirection = (direction: Direction) => {
      $user.bodyDirection = direction;
    };
    const getBodyDirection = (): Direction => $user?.bodyDirection;

    const setRoom = (roomId: string) => {
      $user.roomId = roomId;
      delete $userPathfindingMap[user.accountId];
    };
    const getRoom = (): string => $user.roomId;
    const removeRoom = () => {
      setRoom(null);
      setPosition(null);
      setLastWhisper(null);
    };

    const setAction = (action: UserAction | null) => {
      $userAction = action;
    };
    const getAction = () => $userAction;

    const preMoveToRoom = async (roomId: string) => {
      const foundRoom = await System.game.rooms.get(roomId);

      emit(ProxyEvent.PRE_JOIN_ROOM, {
        room: {
          id: foundRoom.getId(),
          furniture: foundRoom.getFurnitures(),
        },
      });
    };

    const moveToRoom = async (roomId: string) => {
      const currentRoom = getRoom();
      if (currentRoom)
        (await System.game.rooms.get(currentRoom)).removeUser(
          getObject(),
          true,
        );

      await (await System.game.rooms.get(roomId))?.addUser?.(getObject());
    };

    const setTargetPosition = async (targetPosition: Point3d) => {
      const $room = await System.game.rooms.get(getRoom());
      if (!$room) return;

      const pathfinding = $room.findPath({
        start: getPosition(),
        end: targetPosition,
        accountId: user.accountId,
      });

      //if not pf do nothing
      if (!pathfinding.length) {
        //target is spawn, exit <<
        if ($room.getPoint(targetPosition) === RoomPointEnum.SPAWN)
          return $room.removeUser(getObject());
        return;
      }

      $userPathfindingMap[user.accountId] = pathfinding;
    };

    const getPathfinding = (): Point3d[] =>
      $userPathfindingMap[user.accountId] || [];

    const setLastMessage = (message: string) => {
      $userLastMessageMap[user.accountId] = message;
    };
    const getLastMessage = (): string => $userLastMessageMap[user.accountId];

    const setLastWhisper = (whisperUser: UserMutable | null) => {
      $userLastWhisperMap[user.accountId] = whisperUser
        ? whisperUser.getAccountId()
        : null;
    };
    const getLastWhisper = (): UserMutable | null => {
      const accountId = $userLastWhisperMap[user.accountId];
      if (!accountId) return null;
      return get({ accountId });
    };

    const getObject = (): User => $user;

    const setLanguage = (language: Language) => {
      if (!Language[language.toUpperCase()]) return;
      $privateUserMap[user.accountId].language = language;
    };
    const getLanguage = () =>
      $privateUserMap[user.accountId].language ?? Language.EN;

    const getMeta = () => $user.meta ?? null;

    const isOP = async () =>
      System.auth.getOwnerId() === user.accountId ||
      $privateUserMap[user.accountId].admin ||
      (await $getConfig()).op.users.includes(getUsername());

    const disconnect = () =>
      System.proxy.$emit(ProxyEvent.$DISCONNECT_USER, {
        clientId: $privateUserMap[user.accountId].clientId,
      });

    const emit = <Data extends any>(
      event: ProxyEvent,
      data: Data = {} as Data,
    ) =>
      System.proxy.emit({
        event,
        users: getAccountId(),
        data,
      });

    const log = async (...data: string[]) => {
      const createdAt = Date.now();
      const accountId = getAccountId();
      await System.db.set(["usersLogs", accountId, createdAt], {
        accountId,
        createdAt,
        data,
      });
      $log(`${getUsername()} ${data.join(" ")}`);
    };

    return {
      getAccountId,
      getUsername,

      setPosition,
      getPosition,
      getPositionUpdatedAt,

      setBodyDirection,
      getBodyDirection,

      setRoom,
      getRoom,
      removeRoom,

      setAction,
      getAction,

      preMoveToRoom,
      moveToRoom,

      setTargetPosition,

      // setPathfinding,
      getPathfinding,

      setLastMessage,
      getLastMessage,

      setLastWhisper,
      getLastWhisper,

      getObject,

      disconnect,

      setLanguage,
      getLanguage,

      getMeta,

      isOp: isOP,

      emit,

      log,
    };
  };

  const add = async (user: User, privateUser: PrivateUser) => {
    const $user = $getUser(user);
    $userMap[user.accountId] = $user;

    $privateUserMap[privateUser.accountId] = privateUser;

    await System.db.set(["users", user.accountId], {
      accountId: user.accountId,
      username: user.username,
    });
    await System.db.set(["usersByUsername", user.username], user.accountId);

    await $user.log("joined");
  };

  const remove = async (user: User) => {
    const $user = $userMap[user.accountId];
    if (!$user) return;

    const room = await System.game.rooms.get($user.getRoom());
    room?.removeUser($user.getObject());

    delete $userMap[user.accountId];
    delete $privateUserMap[user.accountId];
    delete $userPathfindingMap[user.accountId];

    await $user.log("left");
  };

  const get = ({
    accountId,
    username,
  }: Partial<Pick<User, "accountId" | "username">>): UserMutable | null => {
    if (accountId) return $userMap[accountId];
    if (username)
      return getList().find((user) => user.getUsername() === username);
    return null;
  };

  const getList = () => Object.values($userMap);

  const getCacheUser = async (accountId: string): Promise<CacheUser | null> =>
    await System.db.get(["users", accountId]);

  const $getConfig = (): Promise<UsersConfig> => {
    return getConfig<UsersConfig>({
      defaults: USERS_CONFIG_DEFAULT,
      fileName: "users.yml",
    });
  };

  const setConfig = async (config: UsersConfig): Promise<void> => {
    await getConfig<UsersConfig>({
      values: config,
      defaults: USERS_CONFIG_DEFAULT,
      fileName: "users.yml",
    });
  };

  return {
    load,
    add,
    remove,
    get,
    getList,

    getCacheUser,

    getConfig: $getConfig,
    setConfig,

    $userMap,
  };
};
