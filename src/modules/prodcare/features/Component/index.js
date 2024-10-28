import { Route, Routes } from 'react-router-dom';
import ComponentHomePage from './screens/ComponentHomeScreen';
import ComponentDetailScreen from './screens/ComponentDetailScreen';

Component.propTypes = {};

function Component(props) {
  return (
    <Routes>
      <Route path="/" element={<ComponentHomePage />} />
      <Route path="/detail/:componentId" element={<ComponentDetailScreen />} />
    </Routes>
  );
}

export default Component;
