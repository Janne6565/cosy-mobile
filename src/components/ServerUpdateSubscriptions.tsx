import { useSubscription } from '../hooks/useSubscription';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectActiveInstance } from '../redux/selectors/instanceSelectors';
import { selectServersByInstance } from '../redux/selectors/serverSelectors';
import { updateServer } from '../redux/slices/serverSlice';
import { GameServerDto } from '../types/api';

/**
 * Subscribes to real-time server update topics for all servers of the active instance.
 * Renders nothing — this is a side-effect-only component.
 */
function ServerSubscription({ uuid, instanceId }: { uuid: string; instanceId: string }) {
  const dispatch = useAppDispatch();

  useSubscription<GameServerDto>(
    `/user/topics/game-servers/updates/${uuid}`,
    (server) => {
      if (server?.server_name) {
        dispatch(updateServer({ instanceId, server }));
      }
    },
  );

  return null;
}

export function ServerUpdateSubscriptions() {
  const instance = useAppSelector(selectActiveInstance);
  const servers = useAppSelector(
    instance ? selectServersByInstance(instance.id) : () => [],
  );

  if (!instance) return null;

  return (
    <>
      {servers.map((s) => (
        <ServerSubscription key={s.uuid} uuid={s.uuid} instanceId={instance.id} />
      ))}
    </>
  );
}
