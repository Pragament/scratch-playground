import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import VM from 'scratch-vm';

import costumeLibraryContent from '../lib/libraries/costumes.json';
import spriteTags from '../lib/libraries/sprite-tags';
import LibraryComponent from '../components/library/library.jsx';
import analytics from '../lib/analytics';
import {trackCostumeAdd, trackBackdropAdd} from '../lib/video/event-tracker';

const messages = defineMessages({
    libraryTitle: {
        defaultMessage: 'Choose a Costume',
        description: 'Heading for the costume library',
        id: 'gui.costumeLibrary.chooseACostume'
    }
});


class CostumeLibrary extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleItemSelected'
        ]);
    }
    handleItemSelected (item) {
        const target = this.props.vm.editingTarget;
        const isStage = target.isStage;
        const itemType = isStage ? 'backdrop' : 'costume';
        const itemName = item.name || 'Unknown';
        
        // Console log
        console.log(`${isStage ? 'Backdrop' : 'Costume'} added:`, {
            name: itemName,
            source: 'library',
            isStage: isStage,
            timestamp: new Date().toISOString()
        });
        
        // Google Analytics event
        analytics.event({
            category: itemType,
            action: 'add',
            label: `${itemName} (library)`
        });
        
        // Video recording event
        if (isStage) {
            trackBackdropAdd('library');
        } else {
            trackCostumeAdd('library');
        }
        
        const vmCostume = {
            name: item.name,
            rotationCenterX: item.rotationCenterX,
            rotationCenterY: item.rotationCenterY,
            bitmapResolution: item.bitmapResolution,
            skinId: null
        };
        this.props.vm.addCostumeFromLibrary(item.md5ext, vmCostume);
    }
    render () {
        return (
            <LibraryComponent
                data={costumeLibraryContent}
                id="costumeLibrary"
                tags={spriteTags}
                title={this.props.intl.formatMessage(messages.libraryTitle)}
                onItemSelected={this.handleItemSelected}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

CostumeLibrary.propTypes = {
    intl: intlShape.isRequired,
    onRequestClose: PropTypes.func,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default injectIntl(CostumeLibrary);
