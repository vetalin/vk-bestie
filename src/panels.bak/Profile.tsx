import { Panel, PanelHeader, Group, Avatar, SimpleCell, Spinner, Placeholder } from '@vkontakte/vkui';
import { Icon56UserCircleOutline } from '@vkontakte/icons';
import { useUser } from '../hooks/useUser';

interface ProfilePanelProps {
  id: string;
}

export function ProfilePanel({ id }: ProfilePanelProps) {
  const user = useUser();

  return (
    <Panel id={id}>
      <PanelHeader>Профиль</PanelHeader>

      {!user ? (
        <Group>
          <Spinner size="l" style={{ margin: '20px auto', display: 'block' }} />
        </Group>
      ) : (
        <Group>
          <SimpleCell
            before={<Avatar src={user.photo_200} size={72} />}
            subtitle={`ID: ${user.id}`}
            multiline
          >
            {user.first_name} {user.last_name}
          </SimpleCell>
        </Group>
      )}

      {!user && (
        <Placeholder icon={<Icon56UserCircleOutline />}>
          Данные пользователя недоступны
        </Placeholder>
      )}
    </Panel>
  );
}
