import React, { useMemo } from "react";
import {
  CoreLoaderComponent,
  InitialLoaderComponent,
} from "modules/application";
import {
  ConfigProvider,
  ProxyProvider,
  RouterProvider,
  ModalProvider,
  AssetsProvider,
  AccountProvider,
  TasksProvider,
  PrivateRoomProvider,
  RouterProviderWrapper,
} from "shared/hooks";
import { NesterComponent } from "shared/components";
import { FurnitureProvider } from "shared/hooks";
import { InfoProvider } from "shared/hooks/info";

export const ApplicationComponent = () => {
  const providers = useMemo(
    () => [
      //|\\|//|\\|//|\\|//|\\|//|\\|//|\\|//|\\|
      //|\\|//|\\|//|\\|//|\\|//|\\|//|\\|//|\\|
      TasksProvider,
      InitialLoaderComponent,
      ConfigProvider,
      ProxyProvider,
      AssetsProvider,
      CoreLoaderComponent,
      AccountProvider,
      ModalProvider,
      RouterProvider,
      InfoProvider,
      //|\\|//|\\|//|\\|//|\\|//|\\|//|\\|//|\\|
      //|\\|//|\\|//|\\|//|\\|//|\\|//|\\|//|\\|
      FurnitureProvider,
      PrivateRoomProvider,
      //|\\|//|\\|//|\\|//|\\|//|\\|//|\\|//|\\|
      //|\\|//|\\|//|\\|//|\\|//|\\|//|\\|//|\\|,
      RouterProviderWrapper,
    ],
    [],
  );

  return <NesterComponent components={providers} />;
};
