import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';

import VideoRecordingControlsComponent from '../components/video-recording-controls/video-recording-controls.jsx';
import WebcamPreview from '../components/webcam-preview/webcam-preview.jsx';
import SubtitleOverlay from '../components/subtitle-overlay/subtitle-overlay.jsx';
import VideoRecorder from '../lib/video/video-recorder.js';

import {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    toggleMute,
    toggleCamera,
    toggleSubtitles,
    updateDuration,
    addRecordingEvent
} from '../reducers/video-recording.js';

class VideoRecordingControls extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleStartRecording',
            'handleStopRecording',
            'handlePauseRecording',
            'handleResumeRecording',
            'handleToggleMute',
            'handleToggleCamera',
            'handleToggleSubtitles',
            'updateDurationTimer'
        ]);

        this.videoRecorder = new VideoRecorder();
        this.durationInterval = null;
        this.state = {
            webcamVideoElement: null
        };
    }

    componentDidMount () {
        // Initialize event tracker - we'll use window to access store
        console.log('🎬 Setting up event tracker...');
        if (typeof window !== 'undefined') {
            window.trackRecordingEvent = text => {
                console.log('🎬 trackRecordingEvent called:', text);
                console.log('  - isRecording:', this.props.isRecording);
                console.log('  - isSubtitlesOn:', this.props.isSubtitlesOn);
                
                if (this.props.isRecording && this.props.isSubtitlesOn) {
                    console.log('  - Adding event to Redux');
                    this.props.onAddEvent(text);
                } else {
                    console.log('  - Not recording or subtitles off, skipping');
                }
                console.log('🎬', text);
            };
            console.log('✅ Event tracker ready');
        }
    }

    componentWillUnmount () {
        if (typeof window !== 'undefined') {
            delete window.trackRecordingEvent;
        }
        if (this.durationInterval) {
            clearInterval(this.durationInterval);
        }
        this.videoRecorder.cleanup();
    }

    async handleStartRecording () {
        try {
            // Get the stage canvas (optional, we're recording the whole page now)
            const canvas = this.props.vm.renderer.canvas;

            await this.videoRecorder.startRecording({
                audio: true,
                video: true,
                includeWebcam: true,
                canvas: canvas
            });

            this.props.onStartRecording();

            // Get webcam video element for preview - with a small delay to ensure stream is ready
            setTimeout(() => {
                const webcamVideo = this.videoRecorder.getWebcamVideo();
                console.log('📹 Webcam video element:', webcamVideo);
                console.log('📹 Webcam stream:', this.videoRecorder.webcamStream);
                
                if (webcamVideo) {
                    console.log('📹 Video srcObject:', webcamVideo.srcObject);
                    console.log('📹 Video readyState:', webcamVideo.readyState);
                    
                    // Force video to load and play
                    webcamVideo.load();
                    webcamVideo.play().then(() => {
                        console.log('✅ Webcam video playing');
                    }).catch(err => {
                        console.error('❌ Webcam video play error:', err);
                    });
                }
                
                this.setState({webcamVideoElement: webcamVideo});
            }, 500); // 500ms delay to ensure stream is ready

            // Start duration timer
            this.durationInterval = setInterval(this.updateDurationTimer, 1000);
        } catch (error) {
            console.error('Failed to start recording:', error);
            alert('Failed to start recording. Please check your permissions and try again.');
        }
    }

    async handleStopRecording () {
        try {
            const videoBlob = await this.videoRecorder.stopRecording();

            // Stop duration timer
            if (this.durationInterval) {
                clearInterval(this.durationInterval);
                this.durationInterval = null;
            }

            this.props.onStopRecording();

            // Download the video
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `scratch-recording-${timestamp}.mp4`;
            this.videoRecorder.downloadVideo(videoBlob, filename);
            
            // Clear webcam video element AFTER a delay to prevent timing issues
            setTimeout(() => {
                this.setState({webcamVideoElement: null});
            }, 100);
        } catch (error) {
            console.error('Failed to stop recording:', error);
            alert('Failed to stop recording.');
        }
    }

    handlePauseRecording () {
        this.videoRecorder.pauseRecording();
        this.props.onPauseRecording();
    }

    handleResumeRecording () {
        this.videoRecorder.resumeRecording();
        this.props.onResumeRecording();
    }

    handleToggleMute () {
        this.videoRecorder.toggleMute();
        this.props.onToggleMute();
    }

    handleToggleCamera () {
        const newCameraState = !this.props.isCameraOn;
        this.props.onToggleCamera();
        
        // If turning camera back on, need to refresh the video element
        if (newCameraState && this.videoRecorder.webcamStream) {
            console.log('📹 Turning camera back on...');
            
            // Force a state update by clearing first, then setting
            this.setState({webcamVideoElement: null}, () => {
                setTimeout(() => {
                    const webcamVideo = this.videoRecorder.getWebcamVideo();
                    console.log('📹 Got webcam video:', webcamVideo);
                    console.log('📹 Stream active:', this.videoRecorder.webcamStream?.active);
                    
                    if (webcamVideo && webcamVideo.srcObject) {
                        console.log('📹 Setting webcam video element');
                        this.setState({webcamVideoElement: webcamVideo});
                    } else {
                        console.warn('⚠️ No valid webcam video or stream');
                    }
                }, 100);
            });
        }
    }

    handleToggleSubtitles () {
        this.videoRecorder.toggleSubtitles();
        this.props.onToggleSubtitles();
    }

    updateDurationTimer () {
        const duration = this.videoRecorder.getDuration();
        this.props.onUpdateDuration(duration);
    }

    render () {
        return (
            <React.Fragment>
                <VideoRecordingControlsComponent
                    isRecording={this.props.isRecording}
                    isPaused={this.props.isPaused}
                    isMuted={this.props.isMuted}
                    isCameraOn={this.props.isCameraOn}
                    isSubtitlesOn={this.props.isSubtitlesOn}
                    duration={this.props.duration}
                    onStartRecording={this.handleStartRecording}
                    onStopRecording={this.handleStopRecording}
                    onPauseRecording={this.handlePauseRecording}
                    onResumeRecording={this.handleResumeRecording}
                    onToggleMute={this.handleToggleMute}
                    onToggleCamera={this.handleToggleCamera}
                    onToggleSubtitles={this.handleToggleSubtitles}
                />
                <WebcamPreview
                    videoElement={this.state.webcamVideoElement}
                    isVisible={this.props.isRecording && this.props.isCameraOn}
                    isRecording={this.props.isRecording && !this.props.isPaused}
                />
                <SubtitleOverlay
                    isEnabled={this.props.isRecording && this.props.isSubtitlesOn}
                />
            </React.Fragment>
        );
    }
}

VideoRecordingControls.propTypes = {
    isRecording: PropTypes.bool,
    isPaused: PropTypes.bool,
    isMuted: PropTypes.bool,
    isCameraOn: PropTypes.bool,
    isSubtitlesOn: PropTypes.bool,
    duration: PropTypes.number,
    vm: PropTypes.shape({
        renderer: PropTypes.shape({
            canvas: PropTypes.instanceOf(HTMLCanvasElement)
        })
    }),
    onStartRecording: PropTypes.func.isRequired,
    onStopRecording: PropTypes.func.isRequired,
    onPauseRecording: PropTypes.func.isRequired,
    onResumeRecording: PropTypes.func.isRequired,
    onToggleMute: PropTypes.func.isRequired,
    onToggleCamera: PropTypes.func.isRequired,
    onToggleSubtitles: PropTypes.func.isRequired,
    onUpdateDuration: PropTypes.func.isRequired,
    onAddEvent: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    isRecording: state.scratchGui.videoRecording.isRecording,
    isPaused: state.scratchGui.videoRecording.isPaused,
    isMuted: state.scratchGui.videoRecording.isMuted,
    isCameraOn: state.scratchGui.videoRecording.isCameraOn,
    isSubtitlesOn: state.scratchGui.videoRecording.isSubtitlesOn,
    duration: state.scratchGui.videoRecording.duration,
    vm: state.scratchGui.vm
});

const mapDispatchToProps = dispatch => ({
    onStartRecording: () => dispatch(startRecording()),
    onStopRecording: () => dispatch(stopRecording()),
    onPauseRecording: () => dispatch(pauseRecording()),
    onResumeRecording: () => dispatch(resumeRecording()),
    onToggleMute: () => dispatch(toggleMute()),
    onToggleCamera: () => dispatch(toggleCamera()),
    onToggleSubtitles: () => dispatch(toggleSubtitles()),
    onUpdateDuration: duration => dispatch(updateDuration(duration)),
    onAddEvent: text => dispatch(addRecordingEvent(text))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(VideoRecordingControls);
