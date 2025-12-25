import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import styles from './video-recording-controls.css';

const messages = defineMessages({
    startRecording: {
        id: 'gui.videoRecording.startRecording',
        defaultMessage: 'Start Recording',
        description: 'Button to start video recording'
    },
    stopRecording: {
        id: 'gui.videoRecording.stopRecording',
        defaultMessage: 'Stop Recording',
        description: 'Button to stop video recording'
    },
    pauseRecording: {
        id: 'gui.videoRecording.pauseRecording',
        defaultMessage: 'Pause',
        description: 'Button to pause video recording'
    },
    resumeRecording: {
        id: 'gui.videoRecording.resumeRecording',
        defaultMessage: 'Resume',
        description: 'Button to resume video recording'
    },
    mute: {
        id: 'gui.videoRecording.mute',
        defaultMessage: 'Mute',
        description: 'Button to mute audio'
    },
    unmute: {
        id: 'gui.videoRecording.unmute',
        defaultMessage: 'Unmute',
        description: 'Button to unmute audio'
    },
    cameraOn: {
        id: 'gui.videoRecording.cameraOn',
        defaultMessage: 'Camera On',
        description: 'Button to turn camera on'
    },
    cameraOff: {
        id: 'gui.videoRecording.cameraOff',
        defaultMessage: 'Camera Off',
        description: 'Button to turn camera off'
    },
    subtitlesOn: {
        id: 'gui.videoRecording.subtitlesOn',
        defaultMessage: 'Subtitles On',
        description: 'Button to turn subtitles on'
    },
    subtitlesOff: {
        id: 'gui.videoRecording.subtitlesOff',
        defaultMessage: 'Subtitles Off',
        description: 'Button to turn subtitles off'
    }
});

const VideoRecordingControls = props => {
    const {
        className,
        intl,
        isRecording,
        isPaused,
        isMuted,
        isCameraOn,
        isSubtitlesOn,
        duration,
        onStartRecording,
        onStopRecording,
        onPauseRecording,
        onResumeRecording,
        onToggleMute,
        onToggleCamera,
        onToggleSubtitles
    } = props;

    const formatDuration = seconds => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={classNames(styles.videoRecordingControls, className)}>
            {/* Record Start/Stop Button */}
            {!isRecording ? (
                <button
                    className={classNames(styles.button, styles.recordButton)}
                    onClick={onStartRecording}
                    title={intl.formatMessage(messages.startRecording)}
                >
                    <span className={styles.recordIcon}>⏺</span>
                    {intl.formatMessage(messages.startRecording)}
                </button>
            ) : (
                <button
                    className={classNames(styles.button, styles.stopButton)}
                    onClick={onStopRecording}
                    title={intl.formatMessage(messages.stopRecording)}
                >
                    <span className={styles.stopIcon}>⏹</span>
                    {intl.formatMessage(messages.stopRecording)}
                </button>
            )}

            {/* Pause/Resume Button */}
            {isRecording && (
                !isPaused ? (
                    <button
                        className={classNames(styles.button, styles.pauseButton)}
                        onClick={onPauseRecording}
                        title={intl.formatMessage(messages.pauseRecording)}
                    >
                        <span className={styles.pauseIcon}>⏸</span>
                        {intl.formatMessage(messages.pauseRecording)}
                    </button>
                ) : (
                    <button
                        className={classNames(styles.button, styles.resumeButton)}
                        onClick={onResumeRecording}
                        title={intl.formatMessage(messages.resumeRecording)}
                    >
                        <span className={styles.playIcon}>▶</span>
                        {intl.formatMessage(messages.resumeRecording)}
                    </button>
                )
            )}

            {/* Duration Display */}
            {isRecording && (
                <div className={styles.duration}>
                    {formatDuration(duration)}
                    {isPaused && <span className={styles.pausedIndicator}> (Paused)</span>}
                </div>
            )}

            {/* Mute/Unmute Button */}
            <button
                className={classNames(styles.button, styles.muteButton, {
                    [styles.active]: !isMuted
                })}
                onClick={onToggleMute}
                title={intl.formatMessage(isMuted ? messages.unmute : messages.mute)}
            >
                <span className={styles.icon}>{isMuted ? '🔇' : '🎤'}</span>
            </button>

            {/* Camera On/Off Button */}
            <button
                className={classNames(styles.button, styles.cameraButton, {
                    [styles.active]: isCameraOn
                })}
                onClick={onToggleCamera}
                title={intl.formatMessage(isCameraOn ? messages.cameraOff : messages.cameraOn)}
            >
                <span className={styles.icon}>{isCameraOn ? '📹' : '📷'}</span>
            </button>

            {/* Subtitles On/Off Button */}
            <button
                className={classNames(styles.button, styles.subtitlesButton, {
                    [styles.active]: isSubtitlesOn
                })}
                onClick={onToggleSubtitles}
                title={intl.formatMessage(isSubtitlesOn ? messages.subtitlesOff : messages.subtitlesOn)}
            >
                <span className={styles.icon}>{isSubtitlesOn ? '💬' : '💭'}</span>
            </button>
        </div>
    );
};

VideoRecordingControls.propTypes = {
    className: PropTypes.string,
    intl: intlShape.isRequired,
    isRecording: PropTypes.bool,
    isPaused: PropTypes.bool,
    isMuted: PropTypes.bool,
    isCameraOn: PropTypes.bool,
    isSubtitlesOn: PropTypes.bool,
    duration: PropTypes.number,
    onStartRecording: PropTypes.func.isRequired,
    onStopRecording: PropTypes.func.isRequired,
    onPauseRecording: PropTypes.func.isRequired,
    onResumeRecording: PropTypes.func.isRequired,
    onToggleMute: PropTypes.func.isRequired,
    onToggleCamera: PropTypes.func.isRequired,
    onToggleSubtitles: PropTypes.func.isRequired
};

VideoRecordingControls.defaultProps = {
    isRecording: false,
    isPaused: false,
    isMuted: false,
    isCameraOn: true,
    isSubtitlesOn: false,
    duration: 0
};

export default injectIntl(VideoRecordingControls);
