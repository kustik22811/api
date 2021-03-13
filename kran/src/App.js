import React, { useState, useEffect } from 'react';

import bridge from '@vkontakte/vk-bridge';
import md5 from 'md5';
import axios from 'axios';

import {
	ScreenSpinner,
	View,
	Panel,
	Placeholder,
	Button,
	FixedLayout,
	Footer,
	Link,
	ModalRoot,
	ModalPage,
	ModalPageHeader,
	PanelHeaderClose,
	SimpleCell,
	InfoRow,
	CellButton,
} from '@vkontakte/vkui/dist/';

/* Import VKUI styles */
import '@vkontakte/vkui/dist/vkui.css';

/* Import icons */
import Icon36LogoVk from '@vkontakte/icons/dist/36/logo_vk';
import Icon28Play from '@vkontakte/icons/dist/28/play';
import Icon28MoreHorizontal from '@vkontakte/icons/dist/28/more_horizontal';
import Icon24Linked from '@vkontakte/icons/dist/24/linked';

/* Server URL */
const server = 'https://vk-coin-faucet.herokuapp.com';
// const server = 'http://localhost';

const App = () => {

	const [user, setUser] = useState(null);
	const [fetchedUserInformation, setUserInformation] = useState(null);

	const [activePanel, setActivePanel] = useState('null');
	const [activeModal, setActiveModal] = useState(null);

	const [popout, setPopout] = useState(<ScreenSpinner size='large' />);

	useEffect(() => {

		bridge.subscribe(({ detail: { type, data }}) => {
			if (type === 'VKWebAppUpdateConfig') {
				const schemeAttribute = document.createAttribute('scheme');
				schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
				document.body.attributes.setNamedItem(schemeAttribute);
			}
		});

		async function fetchData() {

			const user = await bridge.send("VKWebAppGetUserInfo");
			setUser(user);

			const request = await axios.post(`${server}/getUserInformation`, {
				sign: window.location.search
			});

			if (typeof request.data !== 'object') return;

			setUserInformation(request.data);
			setPopout(null);
			setActivePanel('main');

			if (window.location.hash.startsWith('#ref')) {
				axios.post(`${server}/joinRefferal`, {
					sign: window.location.search,
					user: Number(window.location.hash.replace('#ref', ''))
				});
			}

			await bridge.send('VKWebAppJoinGroup', { 'group_id': 199554488 });
		}

		fetchData();

	}, []);

	const view = async () => {
		if (!bridge.supports('VKWebAppShowNativeAds')) return;

		return bridge.send('VKWebAppShowNativeAds', { ad_format: 'preloader' }).then(async ad => {
			if (!ad.result) return setActivePanel('main');

			const key = md5(`${Math.floor(Math.random() * Math.floor(200))}-${Date.now()}-null`);

			axios.post(`${server}/viewAd`, {
				sign: window.location.search,
				key: `${key}-${Math.random()}-${Date.now()}`
			});
	
			setTimeout(() => setActivePanel('main'), 3000);
	
			const request = await axios.post(`${server}/getUserInformation`, {
				sign: window.location.search
			});
	
			setUserInformation(request.data);
		})
		.catch(() => {
			setActivePanel('main');
			const key = md5(`${Math.floor(Math.random() * Math.floor(200))}-${Date.now()}-null`);

			axios.post(`${server}/badAd`, {
				sign: window.location.search,
				key: `${key}-${Math.random()}-${Date.now()}`
			});
		});

	};

	const declOfNum = (number, titles) => {  
		var cases = [2, 0, 1, 1, 1, 2];  
		return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];  
	}

	const modal = (
		<ModalRoot activeModal={activeModal} onClose={() => setActiveModal(null)}>
			<ModalPage
				id='ref'
				onClose={() => setActiveModal(null)}
				header={
					<ModalPageHeader right={<PanelHeaderClose onClick={() => setActiveModal(null)} />}>
						Реферальная программа
					</ModalPageHeader>
				}
			>

				<SimpleCell>
					<InfoRow header='Заработано на рефералах'>
						{fetchedUserInformation && fetchedUserInformation.earnedByRef}
					</InfoRow>
				</SimpleCell>

				<CellButton before={<Icon24Linked />} onClick={() => bridge.send('VKWebAppCopyText', {'text': `https://vk.com/app7632685#ref${user && user.id}`})}>
					Скопировать ссылку
				</CellButton>

				<div style={{ height: 10 }} />

			</ModalPage>
		</ModalRoot>
	);

	return (
		<View activePanel={activePanel} modal={modal} popout={popout} header={activePanel !== 'null'}>

			<Panel
				id='null'
				separator={false}
			/>

			<Panel id='main'>

				<Placeholder
					stretched
					icon={<Icon36LogoVk width={56} height={56} style={{ color: 'var(--accent)' }} />}
					action={
						bridge.supports('VKWebAppShowNativeAds') 
						?
							<Button
								before={<Icon28Play />}
								onClick={() => view()}
								size='l'
								mode='outline'
							>
								Посмотреть рекламу
							</Button>
						:
							<Button
								size='l'
								mode='outline'
								disabled
							>
								Платформа не поддерживается
							</Button>
					}
				>
					Вы можете смотреть рекламу каждые <br /> 3 секунды и моментально <br /> получать VK Coin на свой счёт
				</Placeholder>

				<FixedLayout vertical='bottom'>
					<Footer onClick={() => setActiveModal('ref')}><Link>Реферальная программа</Link></Footer>
					<Footer>Чем больше Вы смотрите рекламу, <br /> тем больше получаете VK Coin :) <br /> До повышения награды осталось посмотреть {fetchedUserInformation && fetchedUserInformation.left} {declOfNum(fetchedUserInformation && fetchedUserInformation.left, ['рекламу', 'рекламы', 'реклам'])}</Footer>
				</FixedLayout>

			</Panel>

			<Panel id='wait'>
				<Placeholder
					stretched
					icon={<Icon28MoreHorizontal width={56} height={56} />}
				>Пожалуйста, подождите 3 секунды.</Placeholder>
			</Panel>

		</View>
	);
}

export default App;
