import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import styles from './subtitle-overlay.css';

class SubtitleOverlay extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            speechText: '', // From speech recognition
            eventText: '', // From Scratch events
            displayTimeout: null,
            isListening: false
        };
        this.recognition = null;
    }

    componentDidMount () {
        console.log('📝 SubtitleOverlay mounted, isEnabled:', this.props.isEnabled);
        if (this.props.isEnabled) {
            this.startSpeechRecognition();
        }
    }

    componentDidUpdate (prevProps) {
        // Check if new event was added
        if (this.props.events.length > prevProps.events.length) {
            const latestEvent = this.props.events[this.props.events.length - 1];
            this.showEvent(latestEvent.text);
        }
        
        // Start/stop speech recognition based on enabled state
        if (this.props.isEnabled !== prevProps.isEnabled) {
            if (this.props.isEnabled) {
                this.startSpeechRecognition();
            } else {
                this.stopSpeechRecognition();
                this.setState({speechText: '', eventText: ''});
                if (this.state.displayTimeout) {
                    clearTimeout(this.state.displayTimeout);
                }
            }
        }
    }

    componentWillUnmount () {
        this.stopSpeechRecognition();
        if (this.state.displayTimeout) {
            clearTimeout(this.state.displayTimeout);
        }
    }

    startSpeechRecognition () {
        // Check if browser supports speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('❌ Speech recognition not supported in this browser');
            console.log('💡 Speech recognition only works in Chrome and Edge');
            return;
        }

        console.log('🎤 Starting speech recognition...');
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.setState({isListening: true});
            console.log('✅ Speech recognition started');
        };

        this.recognition.onresult = event => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            this.setState({
                speechText: finalTranscript || interimTranscript
            });

            // Clear speech text after 3 seconds of final result
            if (finalTranscript) {
                setTimeout(() => {
                    this.setState({speechText: ''});
                }, 3000);
            }
        };

        this.recognition.onerror = event => {
            console.error('Speech recognition error:', event.error);
        };

        this.recognition.onend = () => {
            // Restart if still enabled
            if (this.props.isEnabled) {
                this.recognition.start();
            } else {
                this.setState({isListening: false});
            }
        };

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
        }
    }

    stopSpeechRecognition () {
        if (this.recognition) {
            this.recognition.stop();
            this.recognition = null;
            this.setState({
                speechText: '',
                isListening: false
            });
        }
    }

    showEvent (text) {
        console.log('📝 Showing event:', text);
        
        // Clear existing timeout
        if (this.state.displayTimeout) {
            clearTimeout(this.state.displayTimeout);
        }

        // Show the event text
        this.setState({eventText: text});

        // Hide after 3 seconds
        const timeout = setTimeout(() => {
            this.setState({eventText: ''});
        }, 3000);

        this.setState({displayTimeout: timeout});
    }

    render () {
        const {isEnabled} = this.props;
        const {speechText, eventText, isListening} = this.state;

        // Combine both texts, prioritizing event text
        const displayText = eventText || speechText;

        if (!isEnabled || !displayText) return null;

        return (
            <div className={styles.subtitleOverlay}>
                <div className={classNames(styles.subtitleBox, {
                    [styles.listening]: isListening && !eventText
                })}>
                    <p className={styles.subtitleText}>{displayText}</p>
                </div>
            </div>
        );
    }
}

SubtitleOverlay.propTypes = {
    isEnabled: PropTypes.bool,
    events: PropTypes.arrayOf(PropTypes.shape({
        text: PropTypes.string,
        timestamp: PropTypes.number
    }))
};

SubtitleOverlay.defaultProps = {
    isEnabled: false,
    events: []
};

const mapStateToProps = state => ({
    events: state.scratchGui.videoRecording.events
});

export default connect(mapStateToProps)(SubtitleOverlay);
