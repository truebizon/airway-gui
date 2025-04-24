export const getcompanyName = (operatordata, airwayAdministratorId) => {
  let operatorName = "Not found"; 
  if (operatordata != undefined) {
    for(let i=0; i<operatordata.operatorList.length; i++){
        if (operatordata.operatorList[i].operatorId == airwayAdministratorId) {
          operatorName = operatordata.operatorList[i].operatorName;
          break;
        }
    }
  }
  return operatorName;
}