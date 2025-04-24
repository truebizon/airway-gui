/* 指定した URL から情報を GET
 * @param data_apiで取得したugrd,vgrdのレスポンスデータ（JSON)
 * @returns 座標別の風速・風向のリスト([緯度、経度、風速、風向き]の配列)
 */
import {Decimal} from 'decimal.js';

export const calAirData = (data) => {
  let airinfo = [];
  let airinfolist = [];

  const base_start_lat = Number(data.Data[0].RequestParameters.Lat_start_base);
  const base_start_lng = Number(data.Data[0].RequestParameters.Lon_start_base);
  const lat_interval = Number(data.Data[0].RequestParameters.Lat_interval);
  const lng_interval = Number(data.Data[0].RequestParameters.Lon_interval);
  const width = Number(data.Data[0].RequestParameters.Width);
  const height = Number(data.Data[0].RequestParameters.Height);
  let current_lat = base_start_lat;
  let current_lng = base_start_lng;
  let index = 0;

  for(let i=0; i < height; i++) {
    for(let j=index; j < width+index; j++) {
        let u = data.Data[0].Contents[j];
        let v = data.Data[1].Contents[j];
        // 風速を計算
        let ws = Math.sqrt(u**2 + v**2);
        // 風向を計算
        let radian = Math.atan2(v,u);
        let degree = radian * (180 / Math.PI);
        let wd = 90 - (degree + 180);
        if (wd <=0 ) {
            wd += 360;
        }
        airinfo = [];
        airinfo.push(current_lat); // 緯度
        airinfo.push(current_lng); // 緯度
        airinfo.push(u) // ugrd
        airinfo.push(v) // vgrd
        airinfo.push(ws) // 風速
        airinfo.push(wd) // 風向
        airinfolist.push(airinfo);
        let num_lng1 = new Decimal(current_lng);
        let num_lng2 = new Decimal(lng_interval);
        current_lng = num_lng1.plus(num_lng2).toNumber();
    }
    current_lng = base_start_lng;
    let num_lat1 = new Decimal(current_lat);
    let num_lat2 = new Decimal(lat_interval);
    current_lat = num_lat1.plus(num_lat2).toNumber();
    index = index + width;
  }

  return airinfolist;
}