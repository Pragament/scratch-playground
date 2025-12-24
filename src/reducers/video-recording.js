const RECORDING_START = 'scratch-gui/video-recording/RECORDING_START';
const RECORDING_STOP = 'scratch-gui/video-recording/RECORDING_STOP';
const RECORDING_PAUSE = 'scratch-gui/video-recording/RECORDING_PAUSE';
const RECORDING_RESUME = 'scratch-gui/video-recording/RECORDING_RESUME';
const RECORDING_TOGGLE_MUTE = 'scratch-gui/video-recording/RECORDING_TOGGLE_MUTE';
const RECORDING_TOGGLE_CAMERA = 'scratch-gui/video-recording/RECORDING_TOGGLE_CAMERA';
const RECORDING_TOGGLE_SUBTITLES = 'scratch-gui/video-recording/RECORDING_TOGGLE_SUBTITLES';
const RECORDING_UPDATE_DURATION = 'scratch-gui/video-recording/RECORDING_UPDATE_DURATION';
const RECORDING_ADD_EVENT = 'scratch-gui/video-recording/RECORDING_ADD_EVENT';

const initialState = {
    isRecording: false,
    isPaused: false,
    isMuted: false,
    isCameraOn: true,
    isSubtitlesOn: false,
    duration: 0,
    events: [] // Store events during recording
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case RECORDING_START:
        return Object.assign({}, state, {
            isRecording: true,
            isPaused: false,
            duration: 0,
            events: [] // Clear events when starting new recording
        });
    case RECORDING_STOP:
        return Object.assign({}, state, {
            isRecording: false,
            isPaused: false,
            duration: 0,
            events: [] // Clear events when stopping
        });
    case RECORDING_PAUSE:
        return Object.assign({}, state, {
            isPaused: true
        });
    case RECORDING_RESUME:
        return Object.assign({}, state, {
            isPaused: false
        });
    case RECORDING_TOGGLE_MUTE:
        return Object.assign({}, state, {
            isMuted: !state.isMuted
        });
    case RECORDING_TOGGLE_CAMERA:
        return Object.assign({}, state, {
            isCameraOn: !state.isCameraOn
        });
    case RECORDING_TOGGLE_SUBTITLES:
        return Object.assign({}, state, {
            isSubtitlesOn: !state.isSubtitlesOn
        });
    case RECORDING_UPDATE_DURATION:
        return Object.assign({}, state, {
            duration: action.duration
        });
    case RECORDING_ADD_EVENT:
        return Object.assign({}, state, {
            events: [...state.events, {
                text: action.text,
                timestamp: Date.now()
            }]
        });
    default:
        return state;
    }
};

const startRecording = () => ({
    type: RECORDING_START
});

const stopRecording = () => ({
    type: RECORDING_STOP
});

const pauseRecording = () => ({
    type: RECORDING_PAUSE
});

const resumeRecording = () => ({
    type: RECORDING_RESUME
});

const toggleMute = () => ({
    type: RECORDING_TOGGLE_MUTE
});

const toggleCamera = () => ({
    type: RECORDING_TOGGLE_CAMERA
});

const toggleSubtitles = () => ({
    type: RECORDING_TOGGLE_SUBTITLES
});

const updateDuration = duration => ({
    type: RECORDING_UPDATE_DURATION,
    duration
});

const addRecordingEvent = text => ({
    type: RECORDING_ADD_EVENT,
    text
});

export {
    reducer as default,
    initialState as videoRecordingInitialState,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    toggleMute,
    toggleCamera,
    toggleSubtitles,
    updateDuration,
    addRecordingEvent
};
