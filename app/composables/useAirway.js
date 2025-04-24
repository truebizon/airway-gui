import * as turf from "@turf/turf";

/* 航路区画IDが所属する航路IDを取得
 * @param data 航路一覧のJSONデータ
 * @param id 航路区画ID
 * @returns 航路ID
 */

export const useAirwayGetAirwayIdFromSectionId = (data, id) => {
  let airwayId = 'Not found.';
  let airways = data['airway']['airways'];
  
  airways.forEach((airway) => {
    let tmpAirwayId = airway['airwayId'];
    airway['airwaySections'].forEach((section) => {
      if (section['airwaySectionId'] === id) {
        
        airwayId = tmpAirwayId;
      }
    })
  })

  return airwayId;
}

/* 航路IDに対応する航路名を取得
 * @param data 航路一覧のJSONデータ
 * @param id 航路ID
 * @returns 航路名
 */

export const useAirwayGetAirwayNameFromAirwayId = (data, id) => {
  let airwayName = 'Not found.';
  let airways = data['airway']['airways'];
  airways.forEach((airway) => {
    if (airway['airwayId'] === id) {
      airwayName = airway['airwayName'];
    }
  })

  return airwayName;
}

/* 航路IDに対応する飛行目的を取得
 * @param data 航路一覧のJSONデータ
 * @param id 航路ID
 * @returns 飛行目的
 */

export const useAirwayGetPurposeFromAirwayId = (data, id) => {
  let airwayPurpose = 'Not found.';

  let airways = data['airway']['airways'];
  airways.forEach((airway) => {
    if (airway['airwayId'] === id) {
      airwayPurpose = airway['flightPurpose'];
    }
  })

  return airwayPurpose;
}

/* 航路IDに対応する画定日時を取得
 * @param data 航路一覧のJSONデータ
 * @param id 航路ID
 * @returns 画定日時の文字列
 */

export const useAirwayGetAirwayApplicationDateFromAirwayId = (data, id) => {
  let airwayDate = 'Not found.';
  let airways = data['airway']['airways'];
  airways.forEach((airway) => {
    if (airway['airwayId'] === id) {
      airwayDate = airway['createdAt'];
    }
  })

  return airwayDate;
}

/* 予約情報の航路区画IDのリストから航路点の区間を取得
 * @param data 航路一覧のJSONデータ
 * @param list [航路区画ID, ...]
 * @returns 航路点の区間 (例: 航路点1 ~ 航路点3)
 */

export const useAirwayGetCorridorPointRangeFromSectionIdList = (data, list) => {
  let airwayJunctionRange = 'Not found.';
  let airways = data['airway']['airways'];
  let lastListSectionId = list[0].airwaySectionId;
  let matchingJunctionIds = null;
  
  airways.forEach((airway) => {
    let pointIdList = [];
    airway['airwaySections'].forEach((section) => {
      if (list.some((item) => item.airwaySectionId === (section['airwaySectionId']))) {
        section['airwayJunctionIds'].forEach((point) => {
          pointIdList.push(point);
        })
      }
      if (lastListSectionId === section['airwaySectionId']) {
        matchingJunctionIds = section['airwayJunctionIds']
      }
    })

    if (pointIdList.length > 0) {
      let startId = pointIdList[0];
      let endId = pointIdList[pointIdList.length - 1];
      let startName = null;
      let endName = null;
      //航路の始点と終点が逆の場合の対応
      // listの中身が2個以上かつlistの最初のSectionのJunctionIdの最後とendIdがヒットした場合
      if (list.length > 1 && matchingJunctionIds[matchingJunctionIds.length - 1] === endId) {
        [startId, endId] = [endId, startId];
      } 
      airway['airwayJunctions'].forEach((point) => {
        if (point['airwayJunctionId'] === startId) {
          startName = point['airwayJunctionName'];
        } else if (point['airwayJunctionId'] === endId) {
          endName = point['airwayJunctionName'];
        }
      })

      airwayJunctionRange = startName + ' ~ ' + endName;
      return;
    }
  })

  return airwayJunctionRange;
}

/* 航路の最長区間を取得
 * @param data 航路一覧のJSONデータ
 * @param id 航路ID
 * @returns 航路点の区間 (例: 航路点1 ~ 航路点3)
 */

export const useAirwayGetCorridorPointRangeFromAirwayId = (data, id) => {
  let airwayJunctionRange = 'Not found.';
  let airways = data['airway']['airways'];
  let pointNameList = [];

  airways.forEach((airway) => {
    if (airway['airwayId'] === id) {
      airway['airwayJunctions'].forEach((point) => {
        pointNameList.push(point['airwayJunctionName']);
      })

      airwayJunctionRange = pointNameList[0] + ' ~ ' + pointNameList[pointNameList.length - 1];
      return;
    }
  })

  return airwayJunctionRange;
}

/* 航路区間の最長区間を取得 (～ 全角バージョン)
 * @param data 航路一覧のJSONデータ
 * @param id 航路ID
 * @returns 航路区間の区間 (例: 航路区間A～航路区間C)
 */

export const useAirwayGetSectionRangeFromAirwayIdFullWidth = (data, id) => {
  let sectionRange = 'Not found.';
  let airways = data['airway']['airways'];
  let sectionNameList = [];

  airways.forEach((airway) => {
    if (airway['airwayId'] === id) {
      airway['airwaySections'].forEach((point) => {
        sectionNameList.push(point['airwaySectionName']);
      })

      sectionRange = sectionNameList[0] + '～' + sectionNameList[sectionNameList.length - 1];
      return;
    }
  })

  return sectionRange;
}

/* 航路の最長区間を取得 (～ 全角バージョン)
 * @param data 航路一覧のJSONデータ
 * @param id 航路ID
 * @returns 航路点の区間 (例: 航路点1～航路点3)
 */

export const useAirwayGetCorridorPointRangeFromAirwayIdFullWidth = (data, id) => {
  let airwayJunctionRange = 'Not found.';
  let airways = data['airway']['airways'];
  let pointNameList = [];

  airways.forEach((airway) => {
    if (airway['airwayId'] === id) {
      airway['airwayJunctions'].forEach((point) => {
        pointNameList.push(point['airwayJunctionName']);
      })

      airwayJunctionRange = pointNameList[0] + ' ~ ' + pointNameList[pointNameList.length - 1];
      return;
    }
  })

  return airwayJunctionRange;
}

/* 航路の最長距離を取得
 * @param data 航路一覧のJSONデータ
 * @param id 航路ID
 * @returns 航路の最長距離 (メートル)
 */

export const useAirwayGetFullDistanceFromAirwayId = (data, id) => {
  let airwayDistance = 0;
  let airways = data['airway']['airways'];
  let middlePoints = [];

  airways.forEach((airway) => {
    if (airway['airwayId'] === id) {
      airway['airwayJunctions'].forEach((point) => {
        let coords = point['airways'][0]['airway']['geometry']['coordinates'];
        middlePoints.push([
          (coords[0][0] + coords[2][0]) / 2,
          (coords[0][1] + coords[2][1]) / 2,
          (coords[0][2] + coords[2][2]) / 2,
        ]);
      })
      return;
    }
  })

  // 航路の中心線の距離を求める
  for (let i = 0; i < middlePoints.length - 1; i++) {
    // 三角形の底辺 (xy座標) の距離
    let point0 = turf.point([middlePoints[i][0], middlePoints[i][1]]);
    let point1 = turf.point([middlePoints[i + 1][0], middlePoints[i + 1][1]]);
    let base = turf.distance(point0, point1) * 1000;

    // 高さ
    let height = Math.abs(middlePoints[i][2] - middlePoints[i + 1][2]);

    // 航路の距離に加算
    airwayDistance += Math.floor(Math.sqrt(base ** 2 + height ** 2));
  }

  return airwayDistance;
}

/* 始点と終点の航路点リストをもとに距離を取得
 * @param data 航路一覧のJSONデータ
 * @param id 出発航路区画ID
 * @param list 航路点のリスト
 * @returns 航路区画の間の距離 (メートル)
 */

export const useAirwayGetDistanceFromJunctionNameList = (data, id, list) => {
  let sectionDistance = 0;
  let start = list[0];
  let end = list[1];
  let airways = data['airway']['airways'];
  let middlePoints = [];

  let hit = false;
  airways.forEach((airway) => {
    if (airway['airwayId'] === id) {
      airway['airwayJunctions'].forEach((point) => {
        if (point['airwayJunctionName'] == start) {
          hit = true;
        }
        if (hit == true) {
          let coords = point['airways'][0]['airway']['geometry']['coordinates'];
          middlePoints.push([
            (coords[0][0] + coords[2][0]) / 2,
            (coords[0][1] + coords[2][1]) / 2,
            (coords[0][2] + coords[2][2]) / 2,
          ]);
        }
        if (point['airwayJunctionName'] == end) {
          hit = false;
        }
      })
      return;
    }
  })

  // 航路の中心線の距離を求める
  for (let i = 0; i < middlePoints.length - 1; i++) {
    // 三角形の底辺 (xy座標) の距離
    let point0 = turf.point([middlePoints[i][0], middlePoints[i][1]]);
    let point1 = turf.point([middlePoints[i + 1][0], middlePoints[i + 1][1]]);
    let base = turf.distance(point0, point1) * 1000;

    // 高さ
    let height = Math.abs(middlePoints[i][2] - middlePoints[i + 1][2]);

    // 航路の距離に加算
    sectionDistance += Math.floor(Math.sqrt(base ** 2 + height ** 2));
  }

  return sectionDistance;
}

/* 航路に含まれる航路点名の一覧を取得
 * @param data 航路一覧のJSONデータ
 * @param id 航路ID
 * @returns 航路点の一覧リスト
 */

export const useAirwayGetCorridorPointNameListFromAirwayId = (data, id) => {
  let airwayJunctionList = [];
  let airways = data['airway']['airways'];

  airways.forEach((airway) => {
    if (airway['airwayId'] === id) {
      airway['airwayJunctions'].forEach((point) => {
        airwayJunctionList.push(point['airwayJunctionName']);
      })
    }
  })

  return airwayJunctionList;
}

/* 航路に含まれる航路区画名の一覧を取得
 * @param data 航路一覧のJSONデータ
 * @param id 航路ID
 * @returns 航路点の一覧リスト
 */

export const useAirwayGetCorridorSectionNameListFromAirwayId = (data, id) => {
  let airwaySectionList = [];
  let airways = data['airway']['airways'];

  airways.forEach((airway) => {
    if (airway['airwayId'] === id) {
      airway['airwaySections'].forEach((section) => {
        airwaySectionList.push(section['airwaySectionName']);
      })
    }
  })

  return airwaySectionList;
}

/* 始点と終点の航路点リストをもとに航路区画IDのリストを取得
 * @param data 航路一覧のJSONデータ
 * @param list 航路点のリスト
 * @param id 航路ID
 * @returns 航路区画IDのリスト
 */

export const useAirwayGetSectionIdListFromCorridorPointList = (data, list, id) => {
  let sectionList = [];
  let airways = data['airway']['airways'];
  let start = list[0];
  let end = list[1];
  let startId = '';
  let endId = '';

  airways.forEach((airway) => {
    if (airway['airwayId'] === id) {
      airway['airwayJunctions'].forEach((point) => {
        if (point['airwayJunctionName'] === start) {
          startId = point['airwayJunctionId'];
        } else if (point['airwayJunctionName'] === end) {
          endId = point['airwayJunctionId'];
        }
      })
    }
  })

  let hitCount = 0 // 0:開始点終了点未発見 1:開始点発見 2:終了点発見
  airways.forEach((airway) => {
    if (airway['airwayId'] === id) {
      airway['airwaySections'].forEach((section) => {
        if (hitCount == 0) {
          if (section['airwayJunctionIds'][0] === startId) {
            sectionList.push(section['airwaySectionId']);
            hitCount += 1;
          }
        } else if (hitCount == 1) {
          sectionList.push(section['airwaySectionId']);
          if (section['airwayJunctionIds'][1] === endId) {
            hitCount += 1;
          }
        }
      })
    }
  })

  return sectionList;
}


/* 始点と終点の航路点リストをもとに航路区画IDのリストを取得
 * @param data 航路一覧のJSONデータ
 * @param list 航路点のリスト
 * @param id 航路ID
 * @param startDateTime 開始日時
 * @param endDateTime 終了日時
 * @returns 航路区画IDのリスト
 */

export const useAirwayReservationGetSectionIdListFromCorridorPointList = (data, list, airwayId, startDateTime, endDateTime) => {
  let start = list[0];
  let end = list[1];

  let startId = '';
  let endId = '';

  const airways = data.airway.airways; 
  airways.forEach((airway) => {
    if (airway.airwayId === airwayId) {
      airway.airwayJunctions.forEach((point) => {
        if (point.airwayJunctionName === start) {
          startId = point.airwayJunctionId;
        } else if (point.airwayJunctionName === end) {
          endId = point.airwayJunctionId;
        }
      });
    }
  });

  let hitCount = 0; // 0:開始点未発見 1:開始点発見(区間抽出中) 2:終了点発見
  let sectionList = [];

  for (let i = 0; i < airways.length; i++) {
    let airway = airways[i];
    if (airway.airwayId === airwayId) {
      //airway.airwaySections.forEach((section) => {
        for (let j = 0; j < airway.airwaySections.length; j++) {
        let section = airway.airwaySections[j];
        const pointIds = section.airwayJunctionIds;
        console.log("pointIds",pointIds);
        if (hitCount === 0) {
          // 開始点未発見
          if (pointIds[0] === startId) {
            sectionList.push({
              airwaySectionId: section.airwaySectionId,
              startAt: startDateTime,
              endAt: endDateTime,
            });
            console.log(section.airwaySectionName);
            hitCount = 1; 
          }
        } else if (hitCount === 1) {
          // 開始点発見(区間抽出中)
          if (pointIds[0] === endId) {
            hitCount = 2;
            break;
          }
          sectionList.push({
            airwaySectionId: section.airwaySectionId,
            startAt: startDateTime,
            endAt: endDateTime,
          });
          console.log(section.airwaySectionName);
          }
        }
        if (hitCount === 2) {
          break; 
        }
      }
    }
  return sectionList;
}

/* 航路区画IDが所属する航路区画名を取得
 * @param data 航路一覧のJSONデータ
 * @param id 航路区画ID
 * @returns 航路区画名
 */

export const useAirwaySectionNameFromSectionId = (data, id) => {
  let sectionName = 'Not found.';
  let airways = data['airway']['airways'];
  
  airways.forEach((airway) => {
    airway['airwaySections'].forEach((section) => {
      if (section['airwaySectionId'] === id) {
        sectionName = section['airwaySectionName'];
      }
    })
  })

  return sectionName;
}