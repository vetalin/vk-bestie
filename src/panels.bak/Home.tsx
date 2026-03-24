import { Panel, PanelHeader, Group, Header, SimpleCell, Avatar } from '@vkontakte/vkui';
import { Icon28ChevronRightOutline } from '@vkontakte/icons';
import { useUser } from '../hooks/useUser';

interface HomePanelProps {
  id: string;
  onNavigate: (panel: string) => void;
}

export function HomePanel({ id, onNavigate }: HomePanelProps) {
  const user = useUser();

  return (
    <Panel id={id}>
      <PanelHeader>Главная</PanelHeader>

      {user && (
        <Group header={<Header>Привет</Header>}>
          <SimpleCell
            before={<Avatar src={user.photo_100} size={40} />}
            subtitle="Нажми, чтобы открыть детали"
            after={<Icon28ChevronRightOutline />}
            onClick={() => onNavigate('home-detail')}
          >
            {user.first_name} {user.last_name}
          </SimpleCell>
        </Group>
      )}

      <Group header={<Header>Навигация</Header>}>
        <SimpleCell
          after={<Icon28ChevronRightOutline />}
          onClick={() => onNavigate('home-detail')}
        >
          Открыть детальный экран
        </SimpleCell>
      </Group>
    </Panel>
  );
}
