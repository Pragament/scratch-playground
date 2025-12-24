/**
 * Event tracker for video recording
 * Captures Scratch GUI events and displays them in subtitles
 */

/**
 * Track an event - will be displayed in subtitles if recording
 * @param {string} eventText - Text to display in subtitles
 */
export const trackEvent = eventText => {
    // Always log to console
    console.log('🎬', eventText);

    // Call global function if available (set by video recording container)
    if (typeof window !== 'undefined' && window.trackRecordingEvent) {
        window.trackRecordingEvent(eventText);
    }
};

// Event helper functions
export const trackSpriteAdd = method => {
    const methods = {
        library: 'Added sprite from library',
        surprise: 'Added surprise sprite',
        paint: 'Created new sprite with paint',
        upload: 'Uploaded sprite from file'
    };
    trackEvent(methods[method] || `Added sprite (${method})`);
};

export const trackSpriteDuplicate = spriteName => {
    trackEvent(`Duplicated sprite: ${spriteName}`);
};

export const trackSpriteDelete = spriteName => {
    trackEvent(`Deleted sprite: ${spriteName}`);
};

export const trackCostumeAdd = method => {
    const methods = {
        library: 'Added costume from library',
        upload: 'Uploaded costume from file'
    };
    trackEvent(methods[method] || `Added costume (${method})`);
};

export const trackCostumeDuplicate = costumeName => {
    trackEvent(`Duplicated costume: ${costumeName}`);
};

export const trackCostumeDelete = costumeName => {
    trackEvent(`Deleted costume: ${costumeName}`);
};

export const trackCostumeEdit = costumeName => {
    trackEvent(`Editing costume: ${costumeName}`);
};

export const trackBackdropAdd = method => {
    const methods = {
        library: 'Added backdrop from library',
        upload: 'Uploaded backdrop from file'
    };
    trackEvent(methods[method] || `Added backdrop (${method})`);
};

export const trackBackdropDuplicate = backdropName => {
    trackEvent(`Duplicated backdrop: ${backdropName}`);
};

export const trackBackdropDelete = backdropName => {
    trackEvent(`Deleted backdrop: ${backdropName}`);
};

export const trackBackdropEdit = backdropName => {
    trackEvent(`Editing backdrop: ${backdropName}`);
};
