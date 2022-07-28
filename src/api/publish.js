import {service} from '@/utils/request'

  export function RefreshConfig(){
    var url = "/sde?config";

    return service({
      method:'get',
      url:url,
      responseType:'xml'
    })
  }

  export function GetGeometryTable(projectName){
    var url = '/geoserver?qt=8&project=' + projectName;

    return service({
      method: 'get',
      url: url,
      responseType: 'xml'
    })
  }

  export function publishFunc(url){
    url += "&is_webgl=true";

    return service({
      method:'get',
      url:url,
      responseType:'xml'
    })
  }

  export function publishDomUrl(path,layerName,spatial,maxLevel,minLevel){
    var url = "/dom/publish?src_path=" + path + "&layer_name="+ layerName +"&max_level=" + maxLevel + "&min_level=" + minLevel;
    if(spatial && spatial != ""){
      url += "&spatial=" + spatial;
    }
    url += "&Suffix=true";    
    return url;
  }

  export function publishAddDomUrl(path,layerid,spatial,maxLevel,minLevel){
    var url = "/dom/publish/add?src_path=" + path + "&layer_id="+ layerid +"&max_level=" + maxLevel + "&min_level=" + minLevel;
    if(spatial && spatial != ""){
      url += "&spatial=" + spatial;
    }
    url += "&Suffix=true";
    return url;
  }

  export function publishGridUrl(path,layerName,spatial,maxLevel,minLevel,mergeid){
    var url = "/grid/publish?src_path=" + path + "&layer_name="+ layerName +"&max_level=" + maxLevel + "&min_level=" + minLevel;
    if(mergeid && mergeid!=""){
      url += "&merge_layer_id=" + mergeid;
    }
    if(spatial && spatial != ""){
      url += "&spatial=" + spatial;
    }
    return url;
  }

  export function publishAddGridUrl(path,layerid,spatial,maxLevel,minLevel,mergeid){
    var url = "/grid/publish/add?src_path=" + path + "&layer_id="+ layerid +"&max_level=" + maxLevel + "&min_level=" + minLevel;
    if(mergeid && mergeid!=''){
      url += "&merge_layer_id=" + mergeid;
    }
    if(spatial && spatial != ""){
      url += "&spatial=" + spatial;
    }
    return url;
  }

  export function publishTinUrl(path,layerName,spatial,maxLevel,minLevel,mergeid,dilute){
    var url = "/tin/publish?src_path=" + path + "&layer_name="+ layerName +"&max_level=" + maxLevel + "&min_level=" + minLevel;
    if(spatial && spatial != ""){
      url += "&spatial=" + spatial;
    }
    if(mergeid && mergeid!=''){
      url += "&merge_layer_id=" + mergeid;
    }
    if(dilute && dilute != ""){
      url += "&dilute_value=" + dilute;
    }
    return url;
  }

  export function publishAddTinUrl(path,layerid,spatial,maxLevel,minLevel,mergeid,dilute){
    var url = "/tin/publish/add?src_path=" + path + "&layer_id="+ layerid +"&max_level=" + maxLevel + "&min_level=" + minLevel;
    if(spatial && spatial != ""){
      url += "&spatial=" + spatial;
    }
    if(mergeid && mergeid!=''){
      url += "&merge_layer_id=" + mergeid;
    }
    if(dilute && dilute != ""){
      url += "&dilute_value=" + dilute;
    }
    return url;
  }

  export function publishInciseTinUrl(path,layerid,hasHole,highType,hight,spatial,filling,outline,hole){
    var url = "/tin_incise/publish?src_path=" + path + "&layer_id="+ layerid;
    url += "&has_hole=" + hasHole;
    url += "&hight_type=" + highType;
    url += "&hight=" + hight;
    url += "&spatial=" + spatial;
    url += "&fillingFile=" + filling;
    url += "&outlineFile=" + outline;
    if(hasHole && hole && hole!=''){
      url += "&holeFile=" + hole;
    }
    return url;
  }

  export function publishObliqueUrl(path,layerName,spatial,is_b3dm,is_simplify,mesh_density,is_min_level,min_level,is_compress,compress_image){
    var url = "/oblique/webgl/publish?src_path=" + path + "&layer_name="+ layerName;
    if(spatial && spatial != ""){
      url += "&spatial=" + spatial;
    }
    if(is_b3dm){
      url += "&is_b3dm=true";
    }else{
      url += '&is_b3dm=false';
    }
    if(is_simplify){
      url += "&is_simplify=true&mesh_density=" + mesh_density;
    }
    if(is_min_level){
      url += "&min_level=" + min_level;
    }
    if(is_compress){
      url += "&is_compress_image=" + compress_image;
    }
    return url;
  }

  export function publishInciseObliqueUrl(path,spatial,clipFile,isClip,layerName){
    var url = "/oblique/webgl/publish?request=layer_incise&src_path=" + path + "&clip_file="+ clipFile + "&is_clip=" + isClip;
    url += "&spatial=" + spatial;
    url += "&layer_name=" + layerName;
    
    return url;
  }

  export function publishUpdateObliqueUrl(path,spatial,clipFile,desc,layerName){
    var url = "/oblique/webgl/publish?request=layer_updata&src_path=" + path + "&clip_file="+ clipFile;
    url += "&spatial=" + spatial;
    url += "&layer_desc_path=" + desc;
    url += "&layer_name=" + layerName;
    
    return url;
  }

  export function publishPartsUrl(dataType, path,spatial,layer_name,clamp_path,clamp_level){
    var type = 0;
    if(dataType == 'match'){
      type = 1;
    }else if(dataType == 'billboard'){
      type = 0;
    }
    var url = "/parts/publish?src_path=" + path + "&data_type=" + type + "&layer_name=" + layer_name;
    url += "&spatial="+ spatial;

    if(clamp_path && clamp_path != "" && clamp_level && clamp_level != ""){
      url += "&clamp_path=" + clamp_path;
      url += "&clamp_level=" + clamp_level;
    }

    return url;
  }

  export function publishModelUrl(modelType,srcPath,layerName,spatial,splitSize,centerPos,lightmap,maxPic,clampPath,clampLevel,coordfile){
    var url = '';
    if(modelType == "model"){
      url += "/model/publish?";
    }else if(modelType == "lod"){
      url += "/model/lod/publish?";
    }else if(modelType == "b3dm"){
      url += "/model/b3dm/publish?";
    }else if(modelType == "glb"){
      url += "/model/glb/publish?";
    }
    
    url += "src_path="+srcPath;
    url += "&layer_name="+layerName;
    if(spatial && spatial != ""){
      url += "&spatial=" + spatial;
    }
    if(splitSize && splitSize != ""){
      url += "&split_size=" + splitSize;
    }
    if(centerPos && centerPos != ""){
      url += "&center_pos=" + centerPos;
    }
    if(lightmap && lightmap != ""){
      url += "&lightmap_size=" + lightmap;
    }
    if(maxPic && maxPic != ""){
      url += "&max_pic_size=" + maxPic;
    }
    if(clampPath && clampPath != ""){
      url += "&clamp_path=" + clampPath;
      url += "&clamp_level=" + clampLevel;
    }
    if(coordfile && coordfile != ""){
      url += "&coordfile_path=" + coordfile;
    }
    url += "&data_type=1";
    
    return url;
  }

  export function publishPipelineUrl(guid){
    var url = '/pipeline/publish?service=' + guid;
    return url;
  }

  export function getProcess(layerType,layerName){
    var url = '';
    if(layerType == 'dom' || layerType == 'grid' || layerType == 'tin' || layerType == 'pipeline'){
      url = "/" + layerType + "/publish/";    
      url += "getProgress?layer_name=" + layerName;
    }else{
      if(layerType == 'oblique' || layerType == 'oblique-b3dm'){
        url = '/oblique/webgl';
      }else if(layerType == 'b3dm' || layerType == 'lod' || layerType == 'glb'){
        url = '/model/' + layerType;
      }else if(layerType == 'model'){
        url = '/model';
      }else if(layerType == 'match' || layerType == 'billboard'){
        url = '/parts';
      }
      url += '/publish?request=getProgress&layer_name=' + layerName;
    }
    

    return service({
      method:'get',
      url:url,
      responseType:'json'
    })
  }

  