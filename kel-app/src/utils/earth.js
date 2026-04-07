import L from 'leaflet';
import config from '../config';
import { createApp, h } from 'vue';
import { Icon, showConfirmDialog } from 'vant';
import { getPressureBoxInfo, getValveInfo } from '../api/system';
import { navigateByLocation } from './cordova-tools';

const ICON_SIZE = [32, 32];
const ICON_ANCHOR = [16, 32];
const ZOOM_LEVEL_THRESHOLD = 15;
const ZOOM_LEVEL_DETAILED_THRESHOLD = 16;

let pressureBoxList = [];
let valveList = [];
let lastMarkers = [];

async function fetchPressureBoxAndValveInfo() {
  // if (!pressureBoxList.length) {
  const res1 = await getPressureBoxInfo();
  pressureBoxList = res1.data.rows.filter(Boolean);
  // }
  // if (!valveList.length) {
  const res2 = await getValveInfo();
  valveList = res2.data.rows.filter(Boolean);
  // }

  drawPressureBoxAndValveMarkers.call(this);
}

function clearPreviousMarkers() {
  if (lastMarkers.length) {
    lastMarkers.forEach(marker => marker.remove());
    lastMarkers = [];
  }
}

function drawPressureBoxAndValveMarkers() {
  clearPreviousMarkers();

  const zoomLevel = this.viewer.getZoom();
  // 获取可见视口范围边界坐标
  const bounds = this.viewer.getBounds();

  if (zoomLevel < ZOOM_LEVEL_THRESHOLD) return;

  const visibleValves = valveList
    .filter(item => bounds.contains(L.latLng([item.y, item.x])))
    .map(item => ({
      ...item,
      label: item.valvewellcode,
      image: new URL('/src/assets/image/check/icon-fj.png', import.meta.url).href,
      callback: marker => lastMarkers.push(marker),
      flag: true, // 标记是否替代图层
      clickCallback() {
        showConfirmDialog({
          title: '提示',
          message: `是否导航到阀门井${item.valvewellcode}?`,
        })
          .then(() => {
            navigateByLocation(item.y, item.x, item.valvewellcode);
          })
          .catch(() => {
            // on cancel
          });
      },
    }));

  this.addBillboards(visibleValves);

  if (zoomLevel < ZOOM_LEVEL_DETAILED_THRESHOLD) return;

  const visiblePressureBoxes = pressureBoxList
    .filter(item => bounds.contains(L.latLng([item.y, item.x])))
    .map(item => ({
      ...item,
      label: item.compressorboxcode,
      image: new URL('/src/assets/image/check/icon-tyx.png', import.meta.url).href,
      callback: marker => lastMarkers.push(marker),
      flag: true, // 标记是否替代图层
      clickCallback() {
        showConfirmDialog({
          title: '提示',
          message: `是否导航到调压箱${item.compressorboxcode}?`,
        })
          .then(() => {
            navigateByLocation(item.y, item.x, item.compressorboxcode);
          })
          .catch(() => {
            // on cancel
          });
      },
    }));

  this.addBillboards(visiblePressureBoxes);
}

export default class Earth {
  constructor(map, options = {}) {
    const { showBoxAndValve = true } = options;
    this.viewer = L.map(map, {
      zoomControl: false,
      attributionControl: false,
      zoom: 13,
      maxZoom: 19,
      minZoom: 10,
      // zoomAnimation: false,
      // fadeAnimation: false,
      // maxNativeZoom: 24,
      // scrollWheelZoom: false,
    }).setView([41.69695014900003, 86.16914527800003], 10);

    this.initLayers(showBoxAndValve);
    this.initUI(map);
    if (showBoxAndValve) {
      fetchPressureBoxAndValveInfo.call(this);
    }
  }

  initLayers(showBoxAndValve) {
    const wmtsUrl = `${config.mapUrl}/geoserver/gwc/service/wmts?layer=kelgeobase&style=&tilematrixset=EPSG:3857_kelgeobase&Service=WMTS&request=GetTile&Version=1.0.0&format=image/png&TileCol={x}&TileRow={y}&TileMatrix=EPSG:3857_kelgeobase:{z}`;
    const wmtsLayer = L.tileLayer(wmtsUrl, { maxZoom: 19, minZoom: 8, zIndex: 1 });

    const urlTemplate = `${config.mapUrl}/kelimagetiles/{z}/{x}/{y}.png`;
    const urlTemplateLayer = L.tileLayer(urlTemplate, { maxZoom: 19, minZoom: 8, zIndex: 1 });

    const layers = {
      wmts: wmtsLayer,
      urlTemplate: urlTemplateLayer,
      redDot: L.tileLayer(`${config.mapUrl}/keldmtiles/{z}/{x}/{y}.png`, { zIndex: 2 }), //红点图层
      compressorBox: L.tileLayer.wms(`${config.mapUrl}/geoserver/kelgis/wms`, {
        layers: 'kelgis:compressorbox',
        format: 'image/png',
        transparent: true,
        maxZoom: 19,
        minZoom: 10,
        zIndex: 3,
      }),
      station: L.tileLayer.wms(`${config.mapUrl}/geoserver/kelgis/wms`, {
        layers: 'kelgis:station',
        format: 'image/png',
        transparent: true,
        maxZoom: 19,
        minZoom: 10,
        zIndex: 4,
      }),
      // 中低压管线
      mediumLowPressurePipeline: L.tileLayer.wms(`${config.mapUrl}/geoserver/kelgis/wms`, {
        layers: 'kelgis:centlinemp',
        format: 'image/png',
        transparent: true,
        maxZoom: 19,
        minZoom: 10,
        zIndex: 5,
      }),
      highPressurePipeline: L.tileLayer.wms(`${config.mapUrl}/geoserver/kelgis/wms`, {
        layers: 'kelgis:centlinehp',
        format: 'image/png',
        transparent: true,
        maxZoom: 19,
        minZoom: 10,
        zIndex: 6,
      }),
      valveWell: L.tileLayer.wms(`${config.mapUrl}/geoserver/kelgis/wms`, {
        layers: 'kelgis:valvewell',
        format: 'image/png',
        transparent: true,
        maxZoom: 19,
        minZoom: 10,
        zIndex: 7,
      }),
    };

    this.layers = layers;
    [
      layers.urlTemplate,
      layers.redDot,
      layers.station,
      layers.mediumLowPressurePipeline,
      layers.highPressurePipeline,
    ].forEach(layer => layer.addTo(this.viewer));

    this.viewer.on('moveend', () => showBoxAndValve && drawPressureBoxAndValveMarkers.call(this));
  }

  initUI(map) {
    const container = (this.container = document.querySelector(`#${map}`));
    container.style.transform = 'translate3d(0, 0, 0)';
    container.style.willChange = 'transform';
    container.style.position = 'relative';
    container.style.zIndex = 0;

    const btnEl = document.createElement('div');
    container.appendChild(btnEl);
    btnEl.style.position = 'absolute';
    btnEl.style.bottom = '30px';
    btnEl.style.right = '30px';
    btnEl.style.zIndex = 9999;
    btnEl.style.borderRadius = '4px';
    btnEl.style.backgroundColor = '#0002';

    createApp({
      components: { Icon },
      setup: () => () =>
        h(Icon, {
          color: '#000a',
          size: '40px',
          name: 'exchange',
          onclick: e => this.toggleLayers(e),
          ontouchstart: e => e.stopPropagation(),
        }),
    }).mount(btnEl);
  }

  toggleLayers(e) {
    e.stopPropagation();
    const { wmts, urlTemplate } = this.layers;
    if (urlTemplate._map) {
      urlTemplate.removeFrom(this.viewer);
      wmts.addTo(this.viewer);
    } else {
      wmts.removeFrom(this.viewer);
      urlTemplate.addTo(this.viewer);
    }
  }

  drawTracks(points, options = {}) {
    if (!points.length) return;

    let divEl;

    const { color = 'blue', needFollow = false, timeSpeedList } = options;

    const polyline = L.polyline(points, { ...options, color }).addTo(this.viewer);
    this.viewer.fitBounds(polyline.getBounds());

    if (needFollow) {
      let currentIndex = 0;
      let timer;
      let timeout = 1000;

      const customIcon = L.icon({
        iconUrl: new URL('../../src/assets/image/check/icon-person-trail.png', import.meta.url)
          .href,
        iconSize: ICON_SIZE,
        iconAnchor: ICON_ANCHOR,
      });

      const marker = L.marker(points[0], { icon: customIcon, zIndexOffset: 10000 }).addTo(
        this.viewer
      );

      const moveMarker = (points, marker, index) => {
        currentIndex = index;

        if (index < points.length) {
          marker.setLatLng(points[index]);
          timer = setTimeout(() => moveMarker(points, marker, index + 1), timeout);
          if (divEl) {
            divEl.style.display = 'block';
            divEl.innerHTML = `
              <div>
                时间: ${timeSpeedList[currentIndex][0]}
              </div>
              <div>
                速度: ${timeSpeedList[currentIndex][1]}
              </div>
              `;
          }
        } else {
          moveMarker(points, marker, 0);
        }
      };

      moveMarker(points, marker, 0);

      const inputEl = document.createElement('input');
      this.container.appendChild(inputEl);
      inputEl.type = 'range';
      inputEl.min = '0';
      inputEl.max = '10';
      inputEl.value = '0';
      inputEl.style.position = 'absolute';
      inputEl.style.bottom = '20px';
      inputEl.style.left = '10px';
      inputEl.style.zIndex = 9999;
      inputEl.oninput = e => {
        clearTimeout(timer);
        timeout = 1000 * (0.1 ** 0.2) ** e.target.value + 10;
        moveMarker(points, marker, currentIndex);
      };
      inputEl.ontouchstart = e => e.stopPropagation();
    }

    const showTimeSpeed = () => {
      divEl = document.createElement('div');
      this.container.appendChild(divEl);
      divEl.style.position = 'absolute';
      divEl.style.top = '20px';
      divEl.style.right = '20px';
      divEl.style.backgroundColor = '#f008';
      divEl.style.textAlign = 'center';
      divEl.style.color = '#fff';
      divEl.style.zIndex = '9999';
      divEl.style.padding = '6px 4px';
      divEl.style.fontSize = '12px';
      divEl.style.display = 'none';
      divEl.style.fontWeight = '600';
      divEl.style.borderRadius = '5px';
    };

    showTimeSpeed();

    return polyline;
  }

  addBillboard(x, y, imgPath, labelText = '', cb, other = {}) {
    const { callback, flag } = other;
    const iconOptions = {
      iconUrl: imgPath,
      iconSize: flag ? [20, 20] : ICON_SIZE,
      iconAnchor: flag ? undefined : ICON_ANCHOR,
    };

    const customIcon = L.icon(iconOptions);
    const marker = L.marker([y, x], { icon: customIcon, zIndexOffset: 10000 }).addTo(this.viewer);

    if (callback) callback(marker);

    marker.on('click', e => cb && cb(e));

    if (labelText) {
      const html = flag
        ? `<div style="padding: 2px; width: fit-content; text-align: center; transform: translate(30%, -30%); white-space: nowrap; color: #fff; font-size: 16px; text-shadow: 1px 1px 2px rgba(0, 0, 0), -1px 1px 2px rgba(0, 0, 0), 1px -1px 2px rgba(0, 0, 0), -1px -1px 2px rgba(0, 0, 0), 2px 0px 4px rgba(0, 0, 0), -2px 0px 4px rgba(0, 0, 0), 0px 2px 4px rgba(0, 0, 0), 0px -2px 4px rgba(0, 0, 0);">${labelText}</div>`
        : `<div style="background-color: #fff; border: 2px solid #aef; padding: 0 2px; width: fit-content; border-radius: 5px; text-align: center; transform: translate(-40%, 6px); white-space: nowrap;">${labelText}</div>`;

      const labelIcon = L.divIcon({ html, className: 'my-custom-icon' });
      const labelMarker = L.marker([y, x], { icon: labelIcon }).addTo(this.viewer);

      if (callback) callback(labelMarker);
    }
  }

  addBillboards(points) {
    points.forEach(item => {
      const { x, y, label, image, clickCallback, ...other } = item;
      this.addBillboard(x, y, image, label, clickCallback, other);
    });
  }

  addRectLayer(list = []) {
    if (!list.length) return;

    const divEl = document.createElement('div');
    this.container.appendChild(divEl);
    divEl.style.position = 'absolute';
    divEl.style.width = '160px';
    divEl.style.top = '20px';
    divEl.style.left = '20px';
    divEl.style.backgroundColor = '#0006';
    divEl.style.textAlign = 'center';
    divEl.style.color = '#fff';
    divEl.style.borderRadius = '5px';
    divEl.style.zIndex = '9999';
    divEl.style.fontWeight = '600';

    list.forEach(item => {
      const divEl2 = document.createElement('div');
      divEl2.innerText = item.stationName;
      divEl2.style.padding = '5px';
      divEl.appendChild(divEl2);
    });
  }

  drawCircleMarker(points, options = {}) {
    const {
      radius = 10, // 圆形半径（单位：像素）
      color = 'red', // 边框颜色
      fillColor = 'blue', // 填充颜色
      fillOpacity = 0.5, // 填充透明度
    } = options;
    // 创建圆形标记
    for (const p of points) {
      L.circleMarker(p, {
        ...options,
        radius,
        color,
        fillColor,
        fillOpacity,
      }).addTo(this.viewer);
    }
  }
}
