import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './webcam-preview.css';

class WebcamPreview extends React.Component {
    constructor (props) {
        super(props);
        this.videoRef = React.createRef();
    }

    componentDidMount () {
        this.updateVideoSource();
    }

    componentDidUpdate (prevProps) {
        // Update video source when videoElement changes OR when visibility changes
        if (this.props.videoElement !== prevProps.videoElement || 
            this.props.isVisible !== prevProps.isVisible) {
            this.updateVideoSource();
        }
    }

    updateVideoSource () {
        console.log('🔄 Updating video source...');
        console.log('  - videoRef.current:', this.videoRef.current);
        console.log('  - props.videoElement:', this.props.videoElement);
        console.log('  - props.isVisible:', this.props.isVisible);
        
        if (!this.videoRef.current) {
            console.warn('⚠️ videoRef.current is null, waiting for mount');
            return;
        }
        
        if (this.props.videoElement && this.props.isVisible) {
            const srcObject = this.props.videoElement.srcObject;
            console.log('  - srcObject:', srcObject);
            console.log('  - srcObject active:', srcObject?.active);
            
            if (srcObject && srcObject.active) {
                // Always update to ensure fresh connection
                this.videoRef.current.srcObject = srcObject;
                console.log('  - Set srcObject on video element');
                
                // Force reload and play
                this.videoRef.current.load();
                this.videoRef.current.play().then(() => {
                    console.log('✅ Webcam preview video playing');
                }).catch(err => {
                    console.error('❌ Error playing webcam video:', err);
                });
            } else {
                console.warn('⚠️ No active srcObject available');
            }
        } else {
            console.log('  - No videoElement or not visible, clearing stream');
            if (this.videoRef.current.srcObject) {
                this.videoRef.current.srcObject = null;
            }
        }
    }

    render () {
        const {isVisible, isRecording} = this.props;

        if (!isVisible) return null;

        return (
            <div className={classNames(styles.webcamPreview, {
                [styles.recording]: isRecording
            })}>
                <video
                    ref={this.videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={styles.video}
                />
                {isRecording && (
                    <div className={styles.recordingIndicator}>
                        <span className={styles.recordingDot}>⏺</span>
                        REC
                    </div>
                )}
            </div>
        );
    }
}

WebcamPreview.propTypes = {
    videoElement: PropTypes.instanceOf(HTMLVideoElement),
    isVisible: PropTypes.bool,
    isRecording: PropTypes.bool
};

WebcamPreview.defaultProps = {
    isVisible: false,
    isRecording: false
};

export default WebcamPreview;
