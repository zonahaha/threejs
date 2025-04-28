/* eslint-disable no-unused-vars */
import * as echarts from 'echarts';
import { createElement } from '../tools/dom';
import json from '@/assets/mapJson/3dChina.json';
import 'echarts-gl';

export const initMap3D = () => {
  const dom = document.getElementById('china3DContainer');
  Object.assign(dom.style, {
    height: '100%',
    width: '100%',
    position: 'absolute',
  });

  const myChart = echarts.init(dom);

  echarts.registerMap('China', json);

  const options = {
    series: [
      {
        map: 'China',
        type: 'map3D',
        itemStyle: {
          color: '#0f378f',
          opacity: 1,
          borderWidth: 0.5,
          borderColor: '#fff',
        },
      },
    ],
  };

  myChart.setOption(options);
};
