function BinaryParser(stream, bigEndian)
{
    this.stream = stream;
    this.bigEndian = bigEndian;
    
    this.readUInt8  = function() { return this.decodeInt(8, false); }
    this.readUInt16 = function() { return this.decodeInt(16, false); }
    this.readUInt32 = function() { return this.decodeInt(32, false); }
    this.readInt8   = function() { return this.decodeInt(8, true); }
    this.readInt16  = function() { return this.decodeInt(16, true); }
    this.readInt32  = function() { return this.decodeInt(32, true); }
    this.readFloat32 = function(){ return this.decodeFloat32(); }
   
    var pos = 0;
     
    this.decodeInt = function(bits, signed)
    {
        var sum = 0;
        var bytes = bits / 8;
        var byteValue = 0;
        
        // sum bytes
        for (var B=0; B < bytes; B++)
        {
            byteValue = this.bigEndian ? this.stream.charCodeAt(pos+B) 
                                       : this.stream.charCodeAt(pos+(bytes-B-1));
            // sum bits
            for (var b=7; b >= 0; b--)
            {
                sum = sum * 2 + ((1 << b) & byteValue ? 1 : 0);
            }
        }
        
        // account for sign
        if (signed)
        {
            max = Math.pow(2, bits);
            sum = sum >= max / 2 ? sum - max : sum;
        }
        
        // advance stream position
        pos += bytes;
        
        return sum;
	}
	
	// based upon example from: http://en.wikipedia.org/wiki/Binary32
	this.decodeFloat32 = function()
	{
	    var sum = 0;
	    var bytes = 4;
	    var byteValue = new Array(bytes);
	    
	    // read the bytes representing the float
	    for (var B=0; B < bytes; B++)
	    {
	        this.bigEndian ? byteValue[B] = this.stream.charCodeAt(pos+B)
	                       : byteValue[B] = this.stream.charCodeAt(pos+(bytes-B-1));
	    }
	    
	    // read sign bit (bit 31)
	    var negative = byteValue[0] & 0x80;

	    // read exponent bits (bits 30-23)
	    var exponent = 0; 
	    for (var e=6; e >= 0; e--)
        {
            exponent = exponent * 2 + ((1 << e) & byteValue[0] ? 1 : 0);
        }
        exponent = exponent * 2 + (0x80 & byteValue[1] ? 1 : 0);
	    
	    // read significand bits (bits 22-0)
	    var significand = 0;
	    // byte 1
	    for (var s=6; s >= 0; s--)
	    {
	        significand = significand * 2 + ((1 << s) & byteValue[1] ? 1 : 0);
	    }
	    // byte 2, 3
	    for (var B=2; B <= 3; B++)
	    {
	        for (var s=7; s >= 0; s--)
	        {
	            significand = significand * 2 + ((1 << s) & byteValue[B] ? 1 : 0);
	        }
	    }

        // decode exponent by subtracting 127
        var decodedExponent = exponent - 127;
        
        // decode the significand using:
        // each of the 24 bits of the significand, bit 23 to bit 0, represents a value, 
        // starting at 1 and halves for each bit:
        // bit 23 = 1
        // bit 22 = 0.5
        // bit 21 = 0.25
        // bit 20 = 0.125
        // bit 19 = 0.0625
        // .
        // .
        // bit  0 = 0.00000011920928955078125
        var decodedSignificand = 1; // implicit 24th bit set to 1
        var bitvalue = 1;
        for (var s=23; s >= 0; s--)
        {
            decodedSignificand = decodedSignificand + ((1 << s) & significand ? bitvalue : 0);
            bitvalue /= 2;
        }
        
        // multiply significand with the base, 2, to the power of the exponent to get the final result
        sum = decodedSignificand * Math.pow(2, decodedExponent) * (negative ? -1 : 1);
        
	    // advance stream position
	    pos += bytes;
	    
	    return sum;
	}
}