import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import throttle from 'lodash.throttle';
import VM from 'scratch-vm';
import PaintEditor from 'scratch-paint';
import {inlineSvgFonts} from 'scratch-svg-renderer';

import {connect} from 'react-redux';
import analytics from '../lib/analytics';

class PaintEditorWrapper extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleUpdateImage',
            'handleUpdateName',
            'logEditEvent'
        ]);
        
        // Throttle edit logging to once per 5 seconds to avoid spam
        this.logEditEvent = throttle(this.logEditEvent, 5000, {leading: true, trailing: false});
    }
    shouldComponentUpdate (nextProps) {
        return this.props.imageId !== nextProps.imageId ||
            this.props.rtl !== nextProps.rtl ||
            this.props.name !== nextProps.name;
    }
    handleUpdateName (name) {
        this.props.vm.renameCostume(this.props.selectedCostumeIndex, name);
    }
    logEditEvent (costumeName, isVector, isStage) {
        const itemType = isStage ? 'backdrop' : 'costume';
        
        // Console log
        console.log(`${isStage ? 'Backdrop' : 'Costume'} edited:`, {
            name: costumeName,
            isVector: isVector,
            isStage: isStage,
            timestamp: new Date().toISOString()
        });
        
        // Google Analytics event
        analytics.event({
            category: itemType,
            action: 'edit',
            label: `${costumeName} (${isVector ? 'vector' : 'bitmap'})`
        });
    }
    handleUpdateImage (isVector, image, rotationCenterX, rotationCenterY) {
        const target = this.props.vm.editingTarget;
        const isStage = target.isStage;
        const costumeName = target.sprite.costumes[this.props.selectedCostumeIndex].name;
        
        // Log edit event (throttled to avoid spam)
        this.logEditEvent(costumeName, isVector, isStage);
        
        if (isVector) {
            this.props.vm.updateSvg(
                this.props.selectedCostumeIndex,
                image,
                rotationCenterX,
                rotationCenterY);
        } else {
            this.props.vm.updateBitmap(
                this.props.selectedCostumeIndex,
                image,
                rotationCenterX,
                rotationCenterY,
                2 /* bitmapResolution */);
        }
    }
    render () {
        if (!this.props.imageId) return null;
        const {
            selectedCostumeIndex,
            vm,
            ...componentProps
        } = this.props;

        return (
            <PaintEditor
                {...componentProps}
                image={vm.getCostume(selectedCostumeIndex)}
                onUpdateImage={this.handleUpdateImage}
                onUpdateName={this.handleUpdateName}
                fontInlineFn={inlineSvgFonts}
            />
        );
    }
}

PaintEditorWrapper.propTypes = {
    imageFormat: PropTypes.string.isRequired,
    imageId: PropTypes.string.isRequired,
    name: PropTypes.string,
    rotationCenterX: PropTypes.number,
    rotationCenterY: PropTypes.number,
    rtl: PropTypes.bool,
    selectedCostumeIndex: PropTypes.number.isRequired,
    vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = (state, {selectedCostumeIndex}) => {
    const targetId = state.scratchGui.vm.editingTarget.id;
    const sprite = state.scratchGui.vm.editingTarget.sprite;
    // Make sure the costume index doesn't go out of range.
    const index = selectedCostumeIndex < sprite.costumes.length ?
        selectedCostumeIndex : sprite.costumes.length - 1;
    const costume = state.scratchGui.vm.editingTarget.sprite.costumes[index];
    return {
        name: costume && costume.name,
        rotationCenterX: costume && costume.rotationCenterX,
        rotationCenterY: costume && costume.rotationCenterY,
        imageFormat: costume && costume.dataFormat,
        imageId: targetId && `${targetId}${costume.skinId}`,
        rtl: state.locales.isRtl,
        selectedCostumeIndex: index,
        vm: state.scratchGui.vm,
        zoomLevelId: targetId
    };
};

export default connect(
    mapStateToProps
)(PaintEditorWrapper);
