import DetectRTC from 'detectrtc';

let rtcState = {
	hasMicrophonePermission: null,
	audioDevices: {},
	DetectRTC: null
};

const checkDetectRTC = (detectRtcCallback = () => {}) => {
	DetectRTC.load(() => {
		detectRtcCallback({
			hasMicrophone: DetectRTC.hasMicrophone,
			hasSpeakers: DetectRTC.hasSpeakers,
			hasWebcam: DetectRTC.hasWebcam,
			audioInputDevices: DetectRTC.audioInputDevices,
			audioOutputDevices: DetectRTC.audioOutputDevices,
			videoInputDevices: DetectRTC.videoInputDevices,
			isWebRTCSupported: DetectRTC.isWebRTCSupported,
			MediaDevices: DetectRTC.MediaDevices,
			isWebsiteHasWebcamPermissions: DetectRTC.isWebsiteHasWebcamPermissions,
			isWebsiteHasMicrophonePermissions: DetectRTC.isWebsiteHasMicrophonePermissions
		})
	});
};

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
					}
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
	requestAudioPermission((res) => {
		rtcState.hasMicrophonePermission = res;
		checkWebRTCCallback(rtcState);	
		listAudioDevices((res) => {
			rtcState.audioDevices = res;
			checkWebRTCCallback(rtcState);
		})
		checkDetectRTC((res) => {
			rtcState.DetectRTC = res;
			checkWebRTCCallback(rtcState);
		})
	});
}

export default checkWebRTC;
