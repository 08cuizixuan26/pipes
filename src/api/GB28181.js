import {service} from '@/utils/request'

export function getDevice() {
  return service({
    responseType: 'json',
    url: '/se_gb28181_server?cmd=getdevice&resType=Json',
    method: 'post',
  })
}

export function upDate(params) {
  var _url = `/se_gb28181_server?cmd=Update&DeviceID=${params.DeviceID}&FieldName=${params.FieldName}&FieldValue=${params.FieldValue}`;
  return service({
    url: _url,
    method: 'post',
  })
}

export function Pause(deviceid) {
  var _url = `/se_gb28181_server?cmd=pause&deviceid=${deviceid}&resType=Json`;
  return service({
    responseType: 'json',
    url: _url,
    method: 'post',
  })
}

export function Resume(deviceid) {
  var _url = `/se_gb28181_server?cmd=resume&deviceid=${deviceid}&resType=Json`;
  return service({
    responseType: 'json',
    url: _url,
    method: 'post',
  })
}

export function GB28181CameraPtzControl(deviceid,type,address,speed) {
  var str = GetSubCMDString(type,address,speed);
  var _url = `/se_gb28181_server?cmd=ptz&deviceid=${deviceid}&controltype=${str}`
  return service({
    responseType: 'json',
    url: _url,
    method: 'post',
  })
}

export function GB28181CameraPtzControlEx(deviceid,ud,udspeed,lr,lrspeed,io,iospeed) {
  var str = GetSubCMDStringEx(ud,udspeed,lr,lrspeed,io,iospeed);
  var _url = `/se_gb28181_server?cmd=ptz&deviceid=${deviceid}&controltype=${str}`
  return service({
    responseType: 'json',
    url: _url,
    method: 'post',
  })
}

function GetSubCMDStringEx( ud, ud_speed, lr, lr_speed, zoom_io, zoom_speed)
{
    var str,strPTZCMD;
    strPTZCMD = "";
    var v = 0;
    var PTZCMD = new Array(8);
    for(var j = 0 ; j < PTZCMD.length ; j++){
      PTZCMD[j] = 0;
    }
    PTZCMD[0] = 0xA5;
    PTZCMD[1] = (v << 4) + ( (PTZCMD[0] >> 4) +  (PTZCMD[0] & 0xF) + (v & 0xF)) & 0xF;
    PTZCMD[2] = 0x0;
    if (ud == 1)
{
        PTZCMD[3] |= 0x08;
  PTZCMD[5] = ud_speed;
}
else if (ud == 2)
{
  PTZCMD[3] |= 0x04;
  PTZCMD[5] = ud_speed;
}
    

if (lr == 1)
{
  PTZCMD[3] |= 0x02;
  PTZCMD[4] = lr_speed;
}
else if (lr == 2)
{
  PTZCMD[3] |= 0x01;
  PTZCMD[4] = lr_speed;
}

if (zoom_io == 1)
{
  PTZCMD[3] |= 0x10;
  PTZCMD[6] = zoom_speed;
}
else if (zoom_io == 2)
{
  PTZCMD[3] |= 0x20;
  PTZCMD[6] = zoom_speed;
}

    var i;
    var sum = 0;
    for(i= 0; i< 7; i++)
    {
        sum += PTZCMD[i];
    }
    PTZCMD[i] = (sum&0xFF);
    for(i= 0; i< 8; i++)
    {
        str = "";
        if (PTZCMD[i] < 16) {
            str += "0"; 
        }
        str += PTZCMD[i].toString(16);
        strPTZCMD += str;
    }

    return strPTZCMD;
}

function GetSubCMDString(p_control_type, p_address,p_speed){
    var str = '';
    var strPTZCMD = '';
    var v = 0;
    var PTZCMD = new Array(8);
    for(var j = 0 ; j < PTZCMD.length ; j++){
      PTZCMD[j] = 0;
    }
    PTZCMD[0] = 0xA5;
    PTZCMD[1] = (v << 4) + ( (PTZCMD[0] >> 4) +  (PTZCMD[0] & 0xF) + (v & 0xF)) & 0xF;
    PTZCMD[2] = (p_address&0xFF);
    switch(p_control_type)
    {
    case 0:
        PTZCMD[3] = 0x08;
        PTZCMD[5] = p_speed;
        break;
    case 1:
        PTZCMD[3] = 0x04;
        PTZCMD[5] = p_speed;
        break;
    case 2:
        PTZCMD[3] = 0x02;
        PTZCMD[4] = p_speed;
        break;
    case 3:
        PTZCMD[3] = 0x01;
        PTZCMD[4] = p_speed;
        break;
    case 4:
        PTZCMD[3] = 0x10;
        PTZCMD[6] = (p_speed << 4);
        break;
    case 5:
        PTZCMD[3] = 0x20;
        PTZCMD[6] = (p_speed << 4);
        break;
    default:
        break;
    }
    var i;
    var sum = 0;
    for(i= 0; i< 7; i++)
    {
        sum += PTZCMD[i];
    }
    PTZCMD[i] = (sum&0xFF);
    for(i= 0; i< 8; i++)
    {
        str = "";
        if (PTZCMD[i] < 16) {
            str += "0"; 
        }
        str += PTZCMD[i].toString(16);
        strPTZCMD += str;
    }
    return strPTZCMD;
}
 



