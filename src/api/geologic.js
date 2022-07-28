import { service, serviceWithoutIp } from '@/utils/request'

export function dropTable(layerId, tableName) {
    var url = "/se_db_sde?service=" + layerId + "&option=drop&table=" + tableName;

    return service({
        method: 'get',
        url: url,
        responseType: 'xml'
    });
}

export function deleteTable(layerId, uFilter, tableName) {
    var url = "/se_db_sde?service=" + layerId + "&option=delete&filter=" + uFilter + "&table=" + tableName;

    return service({
        method: 'get',
        url: url,
        responseType: 'xml'
    });
}

export function getTableField(layerId, qt, dt) {
    var url = `/geologic?service=${layerId}&qt=${qt}&dt=${dt}&pg=0,100`;

    return service({
        method: 'get',
        url: url,
        responseType: 'xml'
    });
}

export function getTableRecords(layerId, dt, pc, pgNum, pgSize) {
    var url = `/geologic?service=${layerId}&qt=17&dt=${dt}&pc=${pc}&ResType=1`;
    pgNum = pgNum - 1 || 0;
    pgSize = pgSize || 10000;
    url += `&pg=${pgNum},${pgSize}`;

    return service({
        method: 'get',
        url: url
    });
}