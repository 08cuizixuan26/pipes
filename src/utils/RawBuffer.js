
    
    function RawBuffer(arrayBuffer) {
        this._buf = new Uint8Array(arrayBuffer);
        this._dv = new DataView(arrayBuffer);
        this._cursor = 0;
        this.size = this._buf.length;
    }
    
    RawBuffer.prototype.readInt8 = function() {
        var temp = this._dv.getInt8(this._cursor, true);
        this._cursor += 1;
        return temp;
    }

    RawBuffer.prototype.readUint8 = function() {
        var temp = this._dv.getUint8(this._cursor, true);
        this._cursor += 1;
        return temp;
    }

    RawBuffer.prototype.readInt16 = function() {
        var temp = this._dv.getInt16(this._cursor, true);
        this._cursor += 2;
        return temp;
    }

    RawBuffer.prototype.readUint16 = function() {
        var temp = this._dv.getUint16(this._cursor, true);
        this._cursor += 2;
        return temp;
    }

    RawBuffer.prototype.readInt32 = function() {
        var temp = this._dv.getInt32(this._cursor, true);
        this._cursor += 4;
        return temp;
    }

    RawBuffer.prototype.readUint32 = function() {
        var temp = this._dv.getUint32(this._cursor, true);
        this._cursor += 4;
        return temp;
    }

    RawBuffer.prototype.readFloat32 = function() {
        var temp = this._dv.getFloat32(this._cursor, true);
        this._cursor += 4;
        return temp;
    }

    RawBuffer.prototype.readFloat64 = function() {
        var temp = this._dv.getFloat64(this._cursor, true);
        this._cursor += 8;
        return temp;
    }

    RawBuffer.prototype.readUint64 = function() {
        var temp = this._dv.getUint32(this._cursor, true);
        this._cursor += 4;
        var low = ((temp << 8) >>> 8).toString(16);
        var high = this._dv.getUint32(this._cursor, true);
        this._cursor += 4;
        var level = (high >>> 16).toString(16);
        high = ((high << 16) >>> 8) | (temp >>> 24);
        high = high.toString(16);
        if (level == '0') {
            if (high == '0' && low == '0') {
                return '0';
            } else if (high == '0') {
                return low;
            } else if (low == '0') {
                return high + '000000';
            } else {
                return high + '000000'.substring(0, 6 - low.length) + low;
            }
        } else {
            return level + '000000'.substring(0, 6 - high.length) + high + '000000'.substring(0, 6 - low.length) + low;
        }
    }

    RawBuffer.prototype.readWString = function() {
        var temp = 0;
        var str = "";
        while (true){
            temp = this._dv.getUint16(this._cursor, true);
            this._cursor += 2;
            if ( temp != 0)
                str += String.fromCharCode(temp);
            else
                break;
        }
        return str;
    }
    
    RawBuffer.prototype.readString = function() {
        var temp = 0;
        var str = "";
        while (true){
            temp = this._dv.getUint8(this._cursor, true);
            this._cursor += 1;
            if ( temp != 0)
                str += String.fromCharCode(temp);
            else
                break;
        }
        return str;
    }
    
    /* RawBuffer.prototype.readStringGbk = function() {
        var temp = 0;
        var temp0 = 0;
         var str = "";
        while (true){
            temp = this._dv.getUint8(this._cursor, true);
            this._cursor += 1;                   
            if (temp <= 0x80) {
                    
             }else {//���Ļ��������ַ�
                temp0 = temp;                    
                temp = this._dv.getUint8(this._cursor, true);
                this._cursor += 1;
                temp = (temp0 << 8)| temp;//�����ֽںϳ�һ��ֵ  
                temp = Gbk2UniArray.get_array()[temp];             
            }

            if (temp!= 0){
               str += String.fromCharCode(temp);
            }else{
               break;
            }            
        }
        
        return str;
    } */
    
    RawBuffer.prototype.readBuf = function(length) {
        var buf = new Uint8Array(this._buf.subarray(this.get_cursor(), length + this.get_cursor()));
        this._cursor += length;
        return buf;
    }

    RawBuffer.prototype.seek_to = function(v_pos) {
        this._cursor = v_pos;
    }

    RawBuffer.prototype.get_cursor = function() {
        return this._cursor;
    }

    RawBuffer.prototype.is_end = function() {
		return this._cursor >= this._buf.length;
	}
	
	
	//////////////
	 RawBuffer.prototype.writeInt8 = function(value) {
        var temp = this._dv.setInt8(this._cursor, value, true);
        this._cursor += 1;
        return temp;
    }

    RawBuffer.prototype.writeUint8 = function(value) {
        var temp = this._dv.setUint8(this._cursor, value, true);
        this._cursor += 1;
        return temp;
    }

    RawBuffer.prototype.writeInt16 = function(value) {
        var temp = this._dv.setInt16(this._cursor, value,  true);
        this._cursor += 2;
        return temp;
    }

    RawBuffer.prototype.writeUint16 = function(value) {
        var temp = this._dv.setUint16(this._cursor, value,  true);
        this._cursor += 2;
        return temp;
    }

    RawBuffer.prototype.writeInt32 = function(value) {
        this._dv.setInt32(this._cursor, value, true);
        this._cursor += 4;
    }

    RawBuffer.prototype.writeUint32 = function(value) {
        this._dv.setUint32(this._cursor, value, true);
        this._cursor += 4;
    }

    RawBuffer.prototype.writeFloat32 = function(value) {
        this._dv.setFloat32(this._cursor, value, true);
        this._cursor += 4;
    }

    RawBuffer.prototype.writeFloat64 = function(value) {
        this._dv.setFloat64(this._cursor, value, true);
        this._cursor += 8;
    }

    RawBuffer.prototype.writeUint64 = function(value) {        
        
        var secondpart = value.substring(value.length - 8);
        var firstpart = value.substring(0, value.length - 8);
        
        var secondpartInt = parseInt(secondpart, 16);
        var firstpartInt = parseInt(firstpart, 16);
        
        this.dv.setUint32(this.cursor, secondpartInt, true);
        this._cursor += 4;
        this.dv.setUint32(this.cursor, firstpartInt, true);        
    }

    RawBuffer.prototype.writeWString = function(value) {
        
        var temp = 0;
        for(var i=0; i<value.length; i++){
                
            temp = value.charCodeAt(i);
            this._dv.setUint16(this.cursor, temp, true);
            this._cursor += 2;       
        }
        
        temp = 0;
        this._dv.setUint16(this.cursor, temp, true);
        this._cursor += 2;  
    }
    
    RawBuffer.prototype.writeBuf = function(value) {
    
        for(var i=0; i<value.length; i++){
            this._dv.setUint8(this._cursor, value[i], true);
            this._cursor += 1;
        }        
    }
    ////////////////////////////////

    export default RawBuffer;


