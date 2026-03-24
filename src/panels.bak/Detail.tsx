import { Panel, PanelHeader, PanelHeaderBack, Group, Placeholder } from '@vkontakte/vkui';
import { Icon56InfoOutline } from '@vkontakte/icons';

interface DetailPanelProps {
  id: string;
  onBack: () => void;
}

export function DetailPanel({ id, onBack }: DetailPanelProps) {
  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={onBack} />}>Детали</PanelHeader>

      <Group>
        <Placeholder icon={<Icon56InfoOutline />} title="Детальный экран">
          Пример вложенного экрана. Замени на нужный контент.
        </Placeholder>
      </Group>
    </Panel>
  );
}
