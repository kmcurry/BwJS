function TextParser(stream)
{
    this.stream = stream;
    
    var pos = 0;
    
    this.readCharacter = function()
    {
        if (pos >= this.stream.length) return null;
        
        return this.stream[pos++];
    }
    
    this.readToken = function()
    {
        var c;
        var token = "";
        
        if (pos >= this.stream.length) return null;
        
        // read leading whitespace
        do
        {
            c = this.stream[pos++];
        }
        while (pos < this.stream.length && isSpace(c));
        
        // read token
		do
		{
			token += c;
			c = this.stream[pos++];
		}
		while (pos < this.stream.length && !isSpace(c));
		
		return (token.length > 0 ? token : null);
    }
    
    this.readLine = function()
    {
        var line = "";
        
        if (pos >= this.stream.length) return null;
        
        while (pos < this.stream.length && this.stream[pos] != '\n')
        {
            line += this.stream[pos++];
        }
        pos++;
        
        return line;        
    }
    
    this.readLineTokens = function()
    {
        var c;
        var p = 0;
        var token = "";
        var tokens = [];
        
        var line = this.readLine();
        if (line == null) return null;

        while (p < line.length)
        {
            // read leading whitespace
            do
            {
                c = line[p++];
            }
            while (p < line.length && isSpace(c));
            
            // read token
		    do
		    {
			    token += c;
			    c = line[p++];
		    }
		    while (p < line.length && !isSpace(c));
    		
		    tokens.push(token);
		    token = "";
		}
		
		return tokens;
    }
}