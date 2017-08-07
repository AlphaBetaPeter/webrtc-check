import browser from 'detect-browser';

let rtcState = {
	hasMicrophonePermission: null,
	isWebRTCSupported: null,
};

const isFirefoxOrSafari = browser && (browser.name === 'firefox' || browser.name === 'safari');

const isWebRTCSupported = () =>
	['RTCPeerConnection', 'webkitRTCPeerConnection', 'mozRTCPeerConnection', 'RTCIceGatherer']
		.filter(item => item in window).length > 0;

const listAudioDevices = (devicesCallback = () => {}) => {
	if (window.navigator.mediaDevices && !!window.navigator.mediaDevices.enumerateDevices) {
		window.navigator.mediaDevices
			.enumerateDevices()
			.then(devices => {
				let defaultAudioOutput = null;
				let defaultAudioInput = null;
				const inputDevices = [];
				const outputDevices = [];
				devices.forEach(device => {
					if(device.kind === 'audioinput'){
						inputDevices.push(device);
						if (!defaultAudioInput && device.deviceId === 'default') {
							defaultAudioInput = device;
						}
					}

					if(device.kind === 'audiooutput'){
						outputDevices.push(device);
						if (!defaultAudioOutput && device.deviceId === 'default') {
							defaultAudioOutput = device;
						}
					}
				});
				const defaultDevices = { input: defaultAudioInput, output: defaultAudioOutput };
				devicesCallback({
					defaultDevices,
					allDevices : {
						inputDevices,
						outputDevices
					},
					hasAudioDevices: !!(inputDevices.length && (outputDevices.length || isFirefoxOrSafari))
				});
			})
			.catch(e => {
				console.error('Error enumerating devices', e); // eslint-disable-line no-console
			});
	} else {
		console.error('Cannot enumerate mediadevices'); // eslint-disable-line no-console
	}
}

const requestAudioPermission = (permissionCallback) => {
	navigator.mediaDevices.getUserMedia({ audio: true, video: false })
		.then(stream => {
			permissionCallback(true);
		}).catch(e => {
			console.error("Audio input permission failed", e);
		});
}


export const checkWebRTC = (checkWebRTCCallback = () => {}) => {
	requestAudioPermission((permissionRes) => {

		rtcState.hasMicrophonePermission = permissionRes;
		rtcState.isWebRTCSupported = isWebRTCSupported();

		checkWebRTCCallback(rtcState);

		listAudioDevices((devicesRes) => {
			rtcState = { ...rtcState, ...devicesRes }
			checkWebRTCCallback(rtcState);
		});

	});
}

export default checkWebRTC;
