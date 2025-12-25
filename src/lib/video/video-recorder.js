/**
 * Video Recorder for capturing screen and audio
 * Supports recording, pause/resume, and outputs MP4 file
 */
class VideoRecorder {
    constructor () {
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.stream = null;
        this.audioStream = null;
        this.isRecording = false;
        this.isPaused = false;
        this.isMuted = false;
        this.isCameraOn = false;
        this.isSubtitlesOn = false;
        this.startTime = null;
        this.pausedDuration = 0;
        this.lastPauseTime = null;
    }

    /**
     * Start recording the screen and audio
     * @param {Object} options - Recording options
     * @param {boolean} options.audio - Include audio
     * @param {boolean} options.video - Include video
     * @param {boolean} options.includeWebcam - Include webcam feed
     * @param {HTMLCanvasElement} options.canvas - Canvas element to record
     * @return {Promise} Resolves when recording starts
     */
    async startRecording ({audio = true, video = true, includeWebcam = true, canvas = null} = {}) {
        try {
            console.log('Starting recording with options:', {audio, video, includeWebcam});

            // STEP 1: Get webcam stream FIRST (this is what user wants to see)
            this.webcamStream = null;
            if (includeWebcam) {
                try {
                    console.log('Requesting webcam access...');
                    this.webcamStream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            width: {ideal: 640},
                            height: {ideal: 480},
                            frameRate: {ideal: 30}
                        },
                        audio: false
                    });
                    this.isCameraOn = true;
                    console.log('✅ Webcam access granted');
                } catch (err) {
                    console.error('❌ Could not get webcam stream:', err);
                    alert('Camera permission denied. Please allow camera access and try again.');
                    throw err;
                }
            }

            // STEP 2: Get audio stream
            if (audio) {
                try {
                    console.log('Requesting microphone access...');
                    this.audioStream = await navigator.mediaDevices.getUserMedia({
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            sampleRate: 44100
                        }
                    });
                    console.log('✅ Microphone access granted');
                } catch (err) {
                    console.error('❌ Could not get audio stream:', err);
                    alert('Microphone permission denied. Recording will continue without audio.');
                }
            }

            // STEP 3: Get display media stream (entire webpage) - OPTIONAL
            let displayStream = null;
            if (video) {
                try {
                    console.log('Requesting screen capture...');
                    displayStream = await navigator.mediaDevices.getDisplayMedia({
                        video: {
                            displaySurface: 'browser',
                            width: {ideal: 1920},
                            height: {ideal: 1080},
                            frameRate: {ideal: 30}
                        },
                        audio: false // We'll get audio separately
                    });
                    console.log('✅ Screen capture granted');
                } catch (err) {
                    console.warn('Could not get display stream, falling back to canvas:', err);
                    // Fallback to canvas if display capture fails
                    if (canvas) {
                        displayStream = canvas.captureStream(30);
                        console.log('✅ Using canvas capture as fallback');
                    } else {
                        console.warn('⚠️ No canvas available, will record webcam only');
                    }
                }
            }

            // Combine streams
            const tracks = [];
            if (displayStream) {
                tracks.push(...displayStream.getVideoTracks());
            } else if (this.webcamStream) {
                // If no display stream, use webcam as main video
                tracks.push(...this.webcamStream.getVideoTracks());
            }
            
            if (this.audioStream && !this.isMuted) {
                tracks.push(...this.audioStream.getAudioTracks());
            }

            if (tracks.length === 0) {
                throw new Error('No video or audio tracks available');
            }

            this.stream = new MediaStream(tracks);
            this.displayStream = displayStream;
            console.log('✅ Combined stream created with', tracks.length, 'tracks');

            // Create MediaRecorder
            const options = {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 2500000 // 2.5 Mbps
            };

            // Fallback to vp8 if vp9 not supported
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'video/webm;codecs=vp8';
            }

            this.mediaRecorder = new MediaRecorder(this.stream, options);
            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.start(100); // Collect data every 100ms
            this.isRecording = true;
            this.isPaused = false;
            this.startTime = Date.now();
            this.pausedDuration = 0;

            return Promise.resolve();
        } catch (error) {
            console.error('Error starting recording:', error);
            return Promise.reject(error);
        }
    }

    /**
     * Stop recording and return the recorded video
     * @return {Promise<Blob>} Resolves with video blob
     */
    stopRecording () {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder || !this.isRecording) {
                reject(new Error('No active recording'));
                return;
            }

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, {type: 'video/webm'});
                this.cleanup();
                resolve(blob);
            };

            this.mediaRecorder.stop();
            this.isRecording = false;
            this.isPaused = false;
        });
    }

    /**
     * Pause the recording
     */
    pauseRecording () {
        if (this.mediaRecorder && this.isRecording && !this.isPaused) {
            this.mediaRecorder.pause();
            this.isPaused = true;
            this.lastPauseTime = Date.now();
        }
    }

    /**
     * Resume the recording
     */
    resumeRecording () {
        if (this.mediaRecorder && this.isRecording && this.isPaused) {
            this.mediaRecorder.resume();
            this.isPaused = false;
            if (this.lastPauseTime) {
                this.pausedDuration += Date.now() - this.lastPauseTime;
                this.lastPauseTime = null;
            }
        }
    }

    /**
     * Toggle mute/unmute audio
     */
    toggleMute () {
        if (this.audioStream) {
            const audioTracks = this.audioStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            this.isMuted = !this.isMuted;
        }
        return this.isMuted;
    }

    /**
     * Toggle camera on/off
     */
    toggleCamera () {
        if (this.webcamStream) {
            const videoTracks = this.webcamStream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            this.isCameraOn = !this.isCameraOn;
        }
        return this.isCameraOn;
    }

    /**
     * Get webcam video element for display
     * @return {HTMLVideoElement} Video element with webcam stream
     */
    getWebcamVideo () {
        if (!this.webcamStream) return null;
        
        if (!this.webcamVideo) {
            this.webcamVideo = document.createElement('video');
            this.webcamVideo.autoplay = true;
            this.webcamVideo.muted = true;
            this.webcamVideo.playsInline = true;
            this.webcamVideo.style.display = 'none'; // Hidden, just for stream reference
        }

        // Set or update the stream
        if (this.webcamVideo.srcObject !== this.webcamStream) {
            this.webcamVideo.srcObject = this.webcamStream;
            // Ensure it starts playing
            this.webcamVideo.play().catch(err => {
                console.warn('Error playing webcam video:', err);
            });
        }

        return this.webcamVideo;
    }

    /**
     * Toggle subtitles on/off
     */
    toggleSubtitles () {
        this.isSubtitlesOn = !this.isSubtitlesOn;
        return this.isSubtitlesOn;
    }

    /**
     * Get recording duration in seconds
     * @return {number} Duration in seconds
     */
    getDuration () {
        if (!this.startTime) return 0;
        const now = this.isPaused ? this.lastPauseTime : Date.now();
        return Math.floor((now - this.startTime - this.pausedDuration) / 1000);
    }

    /**
     * Cleanup resources
     */
    cleanup () {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.displayStream) {
            this.displayStream.getTracks().forEach(track => track.stop());
            this.displayStream = null;
        }
        if (this.webcamStream) {
            this.webcamStream.getTracks().forEach(track => track.stop());
            this.webcamStream = null;
        }
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
            this.audioStream = null;
        }
        if (this.webcamVideo) {
            this.webcamVideo.srcObject = null;
            this.webcamVideo = null;
        }
        this.mediaRecorder = null;
        this.isRecording = false;
        this.isPaused = false;
        this.startTime = null;
        this.pausedDuration = 0;
        this.lastPauseTime = null;
    }

    /**
     * Convert WebM to MP4 (requires ffmpeg.js or server-side conversion)
     * For now, we'll just download as WebM with .mp4 extension
     * @param {Blob} blob - Video blob
     * @return {Blob} Converted blob
     */
    async convertToMP4 (blob) {
        // Note: True MP4 conversion requires ffmpeg.js or server-side processing
        // For simplicity, we return the WebM blob
        // In production, you'd want to use ffmpeg.wasm or a server endpoint
        return blob;
    }

    /**
     * Download the recorded video
     * @param {Blob} blob - Video blob
     * @param {string} filename - Output filename
     */
    downloadVideo (blob, filename = 'scratch-recording.mp4') {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
}

export default VideoRecorder;
