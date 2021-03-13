/* Import CoreJS */
import 'core-js/features/map';
import 'core-js/features/set';

/* Import React */
import React from 'react';
import ReactDOM from 'react-dom';

/* Import app */
import bridge from '@vkontakte/vk-bridge';
import App from './App';

/* Start */
bridge.send('VKWebAppInit');
ReactDOM.render(<App />, document.getElementById('root'));