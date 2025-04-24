export const getareaName = (falltrangeData, airwayid) => {
    let areaName = ""; 
    for(let i=0; i<falltrangeData.fallToleranceRanges.length; i++){
      const is_exist_airwayId = falltrangeData.fallToleranceRanges[i].airwayIdUse.includes(airwayid);
      if (is_exist_airwayId) {
        areaName = falltrangeData.fallToleranceRanges[i].areaName;
        break;
      }
    }
    return areaName;
  }