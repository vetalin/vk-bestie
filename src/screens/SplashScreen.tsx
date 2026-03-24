import { View, ScreenSpinner, Panel } from '@vkontakte/vkui';
import './SplashScreen.css';

export function SplashScreen() {
  return (
    <View activePanel="splash">
      <Panel id="splash" className="SplashScreen">
        <div className="splash-content">
          <div className="splash-logo">👯</div>
          <div className="splash-title">Кто твой Bestie?</div>
          <ScreenSpinner size="medium" />
        </div>
      </Panel>
    </View>
  );
}
