import React from 'react';
import { default as AdagucMapDraw } from './AdagucMapDraw.js';
import AdagucMeasureDistance from './AdagucMeasureDistance.js';
import axios from 'axios';
import $ from 'jquery';
// import Popout from 'react-popout';
var moment = require('moment');
var elementResizeEvent = require('element-resize-event');

import { BACKEND_SERVER_URL, BACKEND_SERVER_XML2JSON } from '../constants/backend';
export default class Adaguc extends React.Component {
  constructor () {
    super();
    this.initAdaguc = this.initAdaguc.bind(this);
    // this.animateLayer = this.animateLayer.bind(this);
    this.resize = this.resize.bind(this);
    this.updateLayer = this.updateLayer.bind(this);
    this.onChangeAnimation = this.onChangeAnimation.bind(this);
    this.timeHandler = this.timeHandler.bind(this);
    this.isAnimating = false;
    this.state = {
      dropdownOpenView: false,
      modal: false,
      activeTab: '1',
      inSigmetModus: false,
      time: undefined
    };
    this.toggleView = this.toggleView.bind(this);
  }

  currentLatestDate = undefined;
  currentBeginDate = undefined;

  /* istanbul ignore next */
  updateLayer (layer) {
    this.webMapJS.setAnimationDelay(200);
    if (!layer) {
      return;
    }
    var timeDim = layer.getDimension('time');
    if (!timeDim) {
      return;
    }
    this.webMapJS.stopAnimating();
    this.props.dispatch(this.props.actions.setWMJSLayers({ layers: this.webMapJS.getLayers(), baselayers: this.webMapJS.getBaseLayers() }));
    layer.onReady = undefined;
    if (layer.getDimension('reference_time')) {
      layer.setDimension('reference_time', layer.getDimension('reference_time').getValueForIndex(layer.getDimension('reference_time').size() - 1), false);
    }
    this.webMapJS.setDimension('time', timeDim.currentValue, true);
    if (this.isAnimating) {
      this.webMapJS.drawAutomatic(moment().utc().subtract(4, 'hours'), moment().utc().add(4, 'hours'));
    } else {
      this.webMapJS.draw();
    }

    setTimeout(function () { layer.parseLayer(this.updateLayer, true); }, 10000);
  }
  timeHandler (e) {
    const wmjstime = this.webMapJS.getDimension('time').currentValue;
    if (!this.prevTime) {
      this.prevTime = wmjstime;
    }
    if (wmjstime !== this.prevTime) {
      this.prevTime = wmjstime;
      this.props.dispatch(this.props.actions.setTimeDimension(wmjstime));
    }
  }
  /* istanbul ignore next */
  resize () {
    var element = document.querySelector('.map .content');
    this.webMapJS.setSize($(element).width(), $(element).height());
    this.webMapJS.draw();
  }

  /* istanbul ignore next */
  initAdaguc (adagucMapRef) {
    const { adagucProperties, actions, dispatch } = this.props;
    if (adagucProperties.mapCreated) {
      return;
    }
    localStorage.setItem('geoweb', JSON.stringify({ 'personal_urls': [] }));
    // eslint-disable-next-line no-undef
    this.webMapJS = new WMJSMap(adagucMapRef, BACKEND_SERVER_XML2JSON);
    var element = document.querySelector('.map .content');
    const width = $(element).width();
    const height = $(element).height();
    this.webMapJS.setSize(width, height);
    elementResizeEvent(element, this.resize);

    // Set the initial projection
    this.webMapJS.setProjection(adagucProperties.projectionName);
    this.webMapJS.setBBOX(adagucProperties.boundingBox.bbox.join());
    // eslint-disable-next-line no-undef
    this.webMapJS.setBaseLayers([new WMJSLayer(adagucProperties.layers.baselayer)]);
    const defaultURLs = ['getServices', 'getOverlayServices'].map((url) => BACKEND_SERVER_URL + '/' + url);
    const allURLs = [...defaultURLs];
    axios.all(allURLs.map((req) => axios.get(req))).then(
      axios.spread((services, overlays) => dispatch(actions.createMap([...services.data, ...JSON.parse(localStorage.getItem('geoweb')).personal_urls], overlays.data[0])))
    );
    this.webMapJS.stopAnimating();
    const newDatalayers = adagucProperties.layers.datalayers.map((datalayer) => {
      // eslint-disable-next-line no-undef
      const newDataLayer = new WMJSLayer(datalayer);
      newDataLayer.setAutoUpdate(true, moment.duration(2, 'minutes').asMilliseconds(), this.updateLayer);
      newDataLayer.onReady = this.updateLayer;
      return newDataLayer;
    });
    this.webMapJS.removeAllLayers();
    newDatalayers.reverse().forEach((layer) => this.webMapJS.addLayer(layer));
    const newActiveLayer = (this.webMapJS.getLayers()[0]);
    this.webMapJS.addListener('ondimchange', this.timeHandler, true);
    if (newActiveLayer) {
      this.webMapJS.setActiveLayer(this.webMapJS.getLayers()[0]);
    }
    // eslint-disable-next-line no-undef
    let currentDate = getCurrentDateIso8601();
    dispatch(actions.setTimeDimension(currentDate.toISO8601()));
    dispatch(actions.setWMJSLayers({ layers: this.webMapJS.getLayers(), baselayers: this.webMapJS.getBaseLayers() }));
    this.webMapJS.draw();
  }

  componentDidMount () {
    this.initAdaguc(this.refs.adaguc);
  }
  componentWillMount () {
    /* Component will unmount, set flag that map is not created */
    const { adagucProperties } = this.props;
    adagucProperties.mapCreated = false;
  }
  componentWillUnmount () {
    if (this.webMapJS) {
      this.webMapJS.destroy();
    }
  }
  orderChanged (currLayers, prevLayers) {
    if (currLayers.length !== prevLayers.length) {
      return true;
    }
    for (var i = currLayers.length - 1; i >= 0; i--) {
      if (currLayers[i].service !== prevLayers[i].service || currLayers[i].name !== prevLayers[i].name) {
        return true;
      }
    }
    return false;
  }
  /* istanbul ignore next */
  componentDidUpdate (prevProps, prevState) {
    // The first time, the map needs to be created. This is when in the previous state the map creation boolean is false
    // Otherwise only change when a new dataset is selected
    const { adagucProperties } = this.props;
    const { layers, boundingBox, timedim, animate, mapMode } = adagucProperties;
      // eslint-disable-next-line no-undef
    if (boundingBox !== prevProps.adagucProperties.boundingBox) {
      this.webMapJS.setBBOX(boundingBox.bbox.join());
      this.webMapJS.draw();
    }
    if (layers !== prevProps.adagucProperties.layers) {
      const { baselayer, datalayers, overlays } = layers;
      if (baselayer !== prevProps.adagucProperties.layers.baselayer || overlays !== prevProps.adagucProperties.layers.overlays) {
        // eslint-disable-next-line no-undef
        const overlayers = overlays.map((overlay) => { const newOverlay = new WMJSLayer(overlay); newOverlay.keepOnTop = true; return newOverlay; });
        // eslint-disable-next-line no-undef
        const newBaselayers = [new WMJSLayer(baselayer)].concat(overlayers);
        this.webMapJS.setBaseLayers(newBaselayers);
      }
      if (datalayers !== prevProps.adagucProperties.layers.datalayers) {
        // TODO refactor this so we don't remove all layers and just update them if count and order remain the same
        if (datalayers.length !== prevProps.adagucProperties.layers.datalayers.length || this.orderChanged(datalayers, prevProps.adagucProperties.layers.datalayers)) {
          this.webMapJS.stopAnimating();
          const newDatalayers = datalayers.map((datalayer) => {
            // eslint-disable-next-line no-undef
            const newDataLayer = new WMJSLayer(datalayer);
            newDataLayer.setAutoUpdate(true, moment.duration(2, 'minutes').asMilliseconds(), this.updateLayer);
            newDataLayer.onReady = this.updateLayer;
            return newDataLayer;
          });
          this.webMapJS.removeAllLayers();
          newDatalayers.reverse().forEach((layer) => this.webMapJS.addLayer(layer));
          const newActiveLayer = (this.webMapJS.getLayers()[0]);
          if (newActiveLayer) {
            this.webMapJS.setActiveLayer(this.webMapJS.getLayers()[0]);
          }
        } else {
          let layers = this.webMapJS.getLayers();
          for (var i = layers.length - 1; i >= 0; i--) {
            layers[i].enabled = datalayers[i].enabled;
            layers[i].opacity = datalayers[i].opacity;
            layers[i].service = datalayers[i].service;
            layers[i].name = datalayers[i].name;
            layers[i].label = datalayers[i].label;
            if (datalayers[i].style) {
              layers[i].currentStyle = datalayers[i].style;
            }
            this.webMapJS.getListener().triggerEvent('onmapdimupdate');
          }
        }
      }
      // this.onChangeAnimation(animate);
      this.props.dispatch(this.props.actions.setWMJSLayers({ layers: this.webMapJS.getLayers(), baselayers: this.webMapJS.getBaseLayers() }));
    }
    if (timedim !== prevProps.adagucProperties.timedim) {
      this.webMapJS.setDimension('time', timedim, true);
    }
    if (animate !== prevProps.adagucProperties.animate) {
      this.onChangeAnimation(animate);
    }
    if (mapMode !== prevProps.adagucProperties.mapMode) {
      switch (mapMode) {
        case 'zoom':
          this.webMapJS.setMapModeZoomBoxIn();
          break;
        case 'pan':
          this.webMapJS.setMapModePan();
          break;
        case 'draw':
          this.webMapJS.setMessage('Press [Esc] to close the polygon.');
          break;
        case 'measure':
          this.webMapJS.setMessage('Click to end measuring. Press [Esc] to delete the measurement.');
          break;
        default:
          this.webMapJS.setMapModeNone();
          break;
      }
      if (!(mapMode === 'draw' || mapMode === 'measure')) {
        this.webMapJS.setMessage('');
      }
    }
    this.webMapJS.draw();
  }

  /* istanbul ignore next */
  onChangeAnimation (value) {
    this.isAnimating = value;
    if (this.isAnimating) {
      this.webMapJS.drawAutomatic(moment().utc().subtract(4, 'hours'), moment().utc().add(4, 'hours'));
    } else {
      this.webMapJS.stopAnimating();
    }
  };
  toggleView () {
    this.setState({
      dropdownOpenView: !this.state.dropdownOpenView
    });
  }
  render () {
    const { adagucProperties, dispatch } = this.props;
    return (
      <div id='adagucwrapper'>
        <div ref='adaguc' />
        <div style={{ margin: '5px 10px 10px 5px ' }}>
          <AdagucMapDraw
            dispatch={dispatch}
            isInEditMode={adagucProperties.mapMode === 'draw' || adagucProperties.mapMode === 'delete'}
            isInDeleteMode={adagucProperties.mapMode === 'delete'}
            webmapjs={this.webMapJS} />
          <AdagucMeasureDistance
            dispatch={dispatch}
            webmapjs={this.webMapJS}
            isInEditMode={adagucProperties.mapMode === 'measure'} />
          <ModelTime webmapjs={this.webMapJS} />
          {/* <ProgTemp webmapjs={this.webmapjs} isOpen={adagucProperties.mapMode === 'progtemp'} /> */}
        </div>
      </div>
    );
  }
};

// class ProgTemp extends React.Component {
//   render () {
//     const { webmapjs, isOpen } = this.props;
//     if (isOpen) {
//       return <Popout url='progtemp'><span>Hi</span></Popout>;
//     } else {
//       return <div />;
//     }
//   }
// }

class ModelTime extends React.Component {
  constructor () {
    super();
    this.updateState = this.updateState.bind(this);
    this.resetState = this.resetState.bind(this);
    this.state = {
      display: null
    };
  }
  updateState () {
    const adagucTime = moment.utc(this.props.webmapjs.getDimension('time').currentValue);
    const now = moment(moment.utc().format('YYYY-MM-DDTHH:mm:ss'));
    const hourDifference = Math.floor(moment.duration(adagucTime.diff(now)).asHours());
    if (hourDifference > 0) {
      this.setState({ display: adagucTime.format('ddd D HH:mm').toString() + ' (+' + (hourDifference - 1) + ')' });
    } else {
      this.setState({ display: adagucTime.format('ddd D HH:mm').toString() + ' (' + (hourDifference) + ')' });
    }
  }
  resetState () {
    this.setState({ display: '' });
  }
  render () {
    const { webmapjs } = this.props;
    if (webmapjs !== undefined) {
      if (this.listenersInitialized === undefined) { // TODO mount/unmount
        this.listenersInitialized = true;
        webmapjs.addListener('ondimchange', this.updateState, true);
        webmapjs.addListener('onmapdimupdate', this.updateState, true);
        webmapjs.addListener('onmapdimchange', this.updateState, true);
      }
      webmapjs.setTimeOffset(this.state.display);
    }
    return <div />;
  }
}
ModelTime.propTypes = {
  webmapjs: React.PropTypes.object
};

Adaguc.propTypes = {
  adagucProperties : React.PropTypes.object.isRequired,
  actions          : React.PropTypes.object.isRequired,
  dispatch         : React.PropTypes.func.isRequired
};
