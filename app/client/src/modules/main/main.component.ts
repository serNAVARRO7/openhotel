import { container } from "@tu/tulip";
import { System } from "system";
import { Event } from "shared/enums";
import { scenesComponent } from "modules/scenes";
import { infoComponent, confirmModalComponent } from "modules/interfaces";

export const mainComponent = () => {
  const $container = container({
    sortableChildren: true,
  });

  const $pageContainer = container();
  const $infoContainer = infoComponent();

  $container.add($pageContainer, $infoContainer);

  let $scene;

  System.proxy.on<any>(Event.WELCOME, async ({ user }) => {
    System.game.users.setCurrentUser(user);

    $scene && $scene.$destroy();

    $scene = scenesComponent();
    $pageContainer.add($scene);
  });
  System.proxy.loaded();

  System.proxy.on(Event.REDIRECT, ({ redirectUrl }) => {
    const confirmModal = confirmModalComponent({
      title: "REDIRECTED",
      description: "You are being redirected to an external site or hotel. Are you sure you want to proceed?",
      label: "Go!",
      onConfirm: () => window.location.replace(redirectUrl),
    });
    $container.add(confirmModal);
  });

  return $container.getComponent(mainComponent);
};
