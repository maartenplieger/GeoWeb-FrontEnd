import React, { PureComponent } from 'react';
import Layers from './Layers';
import { Col, Row, Button } from 'reactstrap';
import { Icon } from 'react-fa';
export default class LayerManager extends PureComponent {
  constructor () {
    super();
    this.makeActiveLayer = this.makeActiveLayer.bind(this);
  }
  makeActiveLayer (index) {
    const { dispatch, panelsActions, activePanelId, panel } = this.props;
    dispatch(panelsActions.setActiveLayer({ layerClicked: index, activePanelId }));
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.activePanelId !== nextProps.activePanelId ||
        this.props.panel.baselayers.length !== nextProps.panel.baselayers.length ||
        this.props.panel.layers.length !== nextProps.panel.layers.length
    ) {
      return true;
    }

    let checkIfLayerArrayChanged = (layers, nextLayers) => {
      for (let i = 0; i < layers.length; ++i) {
        if (layers[i].service !== nextLayers[i].service ||
          layers[i].name !== nextLayers[i].name ||
          layers[i].currentStyle !== nextLayers[i].currentStyle ||
          layers[i].opacity !== nextLayers[i].opacity ||
          layers[i].active !== nextLayers[i].active ||
          layers[i].dimensions.filter((dim) => !dim.name.includes('time')) !== nextLayers[i].dimensions.filter((dim) => !dim.name.includes('time')) ||
          layers[i].enabled !== nextLayers[i].enabled) {
          return true;
        }
      }
    };

    return checkIfLayerArrayChanged(this.props.panel.layers, nextProps.panel.layers) ||
      checkIfLayerArrayChanged(this.props.panel.baselayers, nextProps.panel.baselayers);
  }

  render () {
    const { dispatch, panelsActions, activePanelId, panel, toggleLayerChooser, toggleLayerManager, layerManagerOpen } = this.props;
    if (!panel) {
      return <Col />;
    }
    const baseLayers = panel.baselayers.filter((layer) => !layer.keepOnTop);
    const overLayers = panel.baselayers.filter((layer) => layer.keepOnTop === true);
    const dataLayers = panel.layers;
    let layerManagerClass = layerManagerOpen ? 'LayerManagerOpen' : 'LayerManagerClose';
    return (
      <Col xs='auto' className={'LayerManager ' + layerManagerClass} style={{ flexDirection: 'column' }}>
        <Layers activePanelId={activePanelId} dispatch={dispatch} panelsActions={panelsActions} role='overlays' data={overLayers} color='danger' 
          layerManagerOpen={layerManagerOpen} />
        <Layers onLayerClick={(index) => this.makeActiveLayer(index)} activePanelId={activePanelId}
          dispatch={dispatch} panelsActions={panelsActions} role='datalayers' data={dataLayers} color='info' 
          layerManagerOpen={layerManagerOpen} />
        <Layers activePanelId={activePanelId} dispatch={dispatch} panelsActions={panelsActions} role='maplayers' data={baseLayers} color='success' 
          layerManagerOpen={layerManagerOpen} />
        { /* <Row className='layerinfo' style={{ marginBottom: '0.1rem', height: '1rem' }} /> */ }
        <Row style={{ margin:'auto 0 0 0' }}>
          <Button color='primary' onClick={toggleLayerChooser} style={{ width:'10rem', margin: '0.33rem auto 0 0.33rem' }} title='Add layers'>Add &nbsp;<Icon name='plus' /></Button>
          <Button
            style={{ margin:'0.33rem 0.33rem 0 auto' }}
            color='primary'
            onClick={toggleLayerManager}
            title={layerManagerOpen ? 'Collapse advanced layer controls' : 'Expand advanced layer controls'}><Icon name={layerManagerOpen ? 'angle-double-left' : 'angle-double-right'} /></Button>
        </Row>
      </Col>);
  }
}
