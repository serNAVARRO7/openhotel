import { getRandomString, initLog, log } from "shared/utils/main.ts";
import { getChildWorker, getParentWorker } from "worker_ionic";
import { User, WorkerProps } from "shared/types/main.ts";
import { getServerSocket, ServerClient } from "socket_ionic";

initLog();
const serverWorker = getChildWorker();

serverWorker.on("start", async ({ config, envs }: WorkerProps) => {
  const protocolToken = getRandomString(64);

  let userList: User[] = [];

  const firewallWorker = getParentWorker({
    url: new URL("../firewall/firewall.worker.ts", import.meta.url).href,
  });
  firewallWorker.emit("start", {
    config,
    envs,
    token: protocolToken,
  } as WorkerProps);
  firewallWorker.on("join", ({ session, userId, username }) => {
    userList.push({ session, userId, username });
    firewallWorker.emit("userList", { userList });

    setTimeout(() => {
      userList = userList.filter(
        (user) => !(!user.clientId && user.session === session),
      );
      firewallWorker.emit("userList", { userList });
    }, 5_000);
  });

  const server = getServerSocket(config.proxy.port, (request: Request) => {
    return new Response("404 Not found", { status: 404 });
  });

  server.on("guest", (clientId: string, [token, session]) => {
    if (token !== protocolToken && userList.length >= config.limits.players)
      return false;
    const foundUser = userList.find(
      (user) => !user.clientId && user.session === session,
    );
    if (!foundUser) return false;
    foundUser.clientId = clientId;
    return true;
  });
  server.on("connected", (client: ServerClient) => {
    const foundUser = userList.find((user) => user.clientId === client.id);
    if (!foundUser) return client.close();

    serverWorker.emit("joined", foundUser);

    client.on("data", ({ event, message }) => {
      serverWorker.emit("data", { user: foundUser, event, message });
    });
  });
  server.on("disconnected", (client: ServerClient) => {
    const foundUser = userList.find((user) => user.clientId === client.id);

    userList = userList.filter((user) => user.clientId !== client.id);
    firewallWorker.emit("userList", { userList });

    serverWorker.emit("left", foundUser);
  });
  log(`Proxy started on :${config.proxy.port}`);
});