/* eslint-disable no-unused-vars */
import * as echarts from 'echarts';
import { createElement } from '../tools/dom';
import json from '@/assets/mapJson/provinces.json';
import { getRandomColor } from '../tools/helpers';

function getRandomValue(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function init(mapJson) {
  if (mapJson) {
    await fetch(`https://geo.datav.aliyun.com/areas_v3/bound/${mapJson}.json`)
      .then(async res => {
        mapJson = await res.json();
      })
      .catch(err => {
        console.log(
          `%c${'请求失败'}`,
          'color: #1d4940; border: 1px solid red; padding: 2px'
        );
      });
  } else {
    mapJson = json;
  }

  echarts.registerMap('China', { geoJSON: mapJson });

  return mapJson;
}

function getOptions(mapJson) {
  const data = mapJson.features.map(feature => ({
    name: feature.properties.name,
    value: getRandomValue(500000, 38000000),
    adcode: feature.properties.adcode,
    level: feature.properties.level,
  }));

  // 气泡图data
  const convertData = mapJson.features.map(feature => ({
    name: feature.properties.name,
    value: feature.properties.center,
  }));

  const options = {
    backgroundColor: {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 1,
      y2: 1,
      colorStops: [
        {
          offset: 0,
          color: '#0f378f', // 0% 处的颜色
        },
        {
          offset: 1,
          color: '#00091a', // 100% 处的颜色
        },
      ],
      globalCoord: false, // 缺省为 false
    },
    title: {
      show: true,
      text: '中国地图',
      subtext: '哈哈哈哈副标题',
      left: 'center',
      top: 'top',
      textStyle: {
        color: '#fff',
      },
      subtextStyle: {
        color: '#ffa',
      },
    },
    toolbox: {
      show: true,
      left: 'left',
      feature: {
        dataView: { readonly: true },
        restore: false,
        saveAsImage: false,
      },
    },
    tooltip: {
      trigger: 'item',
      showDelay: 0,
      transitionDuration: 0.2,
    },
    geo: [
      {
        map: 'China',
        roam: true,
        select: false,
        selectedMode: 'single',
        label: {
          show: true,
        },
        itemStyle: {
          // 默认状态
          borderColor: '#fff',
        },
        emphasis: {
          // 选中状态
          areaColor: '#f76d6d',
          borderColor: '#fdae61',
          label: {
            show: true,
          },
        },
      },
    ],
    series: [
      {
        name: '中国',
        type: 'map',
        map: 'China',
        roam: true,
        data: data,
        select: false,
        geoIndex: 0,
      },
      {
        name: 'Top 5',
        type: 'scatter',
        coordinateSystem: 'geo',
        symbol: 'pin',
        symbolSize: [40, 40],
        label: {
          show: true,
          color: '#fff',
          fontSize: 9,
          formatter(value) {
            return value.data.name;
          },
        },
        itemStyle: {
          color: '#fdae61', //标志颜色
        },
        data: convertData,
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke',
        },
        emphasis: {
          scale: 1,
        },
        zlevel: 10,
      },
    ],
    visualMap: {
      left: 'right',
      min: 500000,
      max: 38000000,
      inRange: {
        color: [
          '#313695',
          '#4575b4',
          '#74add1',
          '#abd9e9',
          '#e0f3f8',
          '#ffffbf',
          '#fee090',
          '#fdae61',
          '#f46d43',
          '#d73027',
          '#a50026',
        ],
      },
      text: ['High', 'Low'],
      calculable: true,
      // 解决气泡颜色指定不生效问题，降低优先级
      seriesIndex: '0',
    },
  };

  return {
    options,
    data,
  };
}

let myChart;
let recordList = ['100000_full'];
let returnButton;

export async function initMap(mapJson) {
  const dom  = document.getElementById('flatMapContainer');

  Object.assign(dom.style, {
    height: '100%',
    width: '100%',
    position: 'absolute',
  });

  if (!myChart || myChart?.isDisposed()) {
    myChart = echarts.init(dom);

    if (document.getElementById('returnButton')) return;
    returnButton = document.createElement('button');
    returnButton.innerText = '返回';
    returnButton.setAttribute('id', 'returnButton');

    Object.assign(returnButton.style, {
      right: '20px',
      top: '10px',
      width: '80px',
      color: 'black',
      backgroundColor: getRandomColor(undefined, undefined, 'regular'),
      position: 'fixed',
      border: '1px solid white',
      borderRadius: '5px',
      cursor: 'pointer',
      height: '40px',
      display: 'block',
    });
    returnButton.onclick = () => {
      recordList.pop();
      initMap(recordList[recordList.length - 1]);
      returnButton.style.display = recordList.length > 1 ? 'block' : 'none';
    };
    document.body.appendChild(returnButton);
  }
  mapJson = await init(mapJson);
  const { options, data } = getOptions(mapJson);
  myChart.setOption(options);

  // 先清除已有事件绑定
  myChart.off('selectchanged');

  // 有series的时候只能调用这个方法
  myChart.on('selectchanged', params => {
    const item = data[params.fromActionPayload.dataIndexInside];
    if (['province', 'city', 'district'].includes(item.level)) {
      const name =
        item.level === 'district' ? item.adcode : item.adcode + '_full';
      recordList[recordList.length - 1] !== name && recordList.push(name);

      returnButton.style.display = 'block';
      initMap(name);
    }
  });

  window.addEventListener('resize', () => {
    myChart.resize();
  });
}
