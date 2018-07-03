import React, { PureComponent } from 'react';
import { UnsortableLayer, SortableLayer } from './Layer';
import { Row } from 'reactstrap';
import { SortableContainer } from 'react-sortable-hoc';
import PropTypes from 'prop-types';

const SortableLayers = SortableContainer(({ role, color, data, dispatch, panelsActions, activePanelId, onLayerClick, layerManagerOpen }) => {
  return (
    <Row style={{ flexDirection: 'column' }}>
      {data.map((layer, i) => <SortableLayer onLayerClick={onLayerClick} activePanelId={activePanelId}
        key={i} index={i} layerIndex={i} role={role} color={color} layer={layer} dispatch={dispatch} panelsActions={panelsActions} layerManagerOpen={layerManagerOpen}
      />)}
    </Row>
  );
});

export default class Layers extends PureComponent {
  constructor () {
    super();
    this.onSortEnd = this.onSortEnd.bind(this);
  }
  onSortEnd ({ oldIndex, newIndex }) {
    const { panelsActions, dispatch, role } = this.props;
    const type = role === 'datalayers' ? 'data' : 'overlay';
    if (oldIndex !== newIndex) {
      dispatch(panelsActions.moveLayer({ oldIndex, newIndex, type }));
    }
  };

  render () {
    const { color, role, data, dispatch, panelsActions, activePanelId, onLayerClick, layerManagerOpen } = this.props;
    if (data.length > 1) {
      return (<SortableLayers onLayerClick={onLayerClick} activePanelId={activePanelId} dispatch={dispatch}
        panelsActions={panelsActions} useDragHandle onSortEnd={this.onSortEnd} role={role} color={color} data={data} layerManagerOpen={layerManagerOpen} />);
    } else {
      return <Row style={{ flexDirection: 'column' }}>
        {data.map((layer, i) => <UnsortableLayer onLayerClick={onLayerClick} activePanelId={activePanelId} key={i} index={i}
          layerIndex={i} role={role} color={color} layer={layer} dispatch={dispatch} panelsActions={panelsActions} layerManagerOpen={layerManagerOpen} />)}
      </Row>;
    }
  }
}

Layers.propTypes = {
  panelsActions: PropTypes.object,
  layerManagerOpen: PropTypes.bool,
  role: PropTypes.string,
  dispatch: PropTypes.func,
  color: PropTypes.string,
  data: PropTypes.array,
  activePanelId: PropTypes.number,
  onLayerClick: PropTypes.func
};
