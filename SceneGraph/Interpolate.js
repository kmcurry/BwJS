/*
======================================================================
range()

Given the value v of a periodic function, returns the equivalent value
v2 in the principal interval [lo, hi].  If i isn't NULL, it receives
the number of wavelengths between v and v2.

   v2 = v - i * (hi - lo)

For example, range( 3 pi, 0, 2 pi, i ) returns pi, with i = 1.
====================================================================== */

function range( v, lo, hi )
{
   var v2, r = hi - lo;

   if ( r == 0.0 ) {
      return { value: lo, i: 0 };
   }

   v2 = v - r * Math.floor(( v - lo ) / r );

   return { value: v2, i: -(Math.floor(( v2 - v ) / r + ( ( v2 > v ) ? 0.5 : -0.5 ))) };
}


/*
======================================================================
hermite()

Calculate the Hermite coefficients.
====================================================================== */

function hermite( t )
{
   var t2, t3;

   t2 = t * t;
   t3 = t * t2;

   var h2 = 3 * t2 - t3 - t3;
   var h1 = 1 - h2;
   var h4 = t3 - t2;
   var h3 = h4 - t2 + t;
   
   return { h1: h1, h2: h2, h3: h3, h4: h4 };
}


/*
======================================================================
bezier()

Interpolate the value of a 1D Bezier curve.
====================================================================== */

function bezier( x0, x1, x2, x3, t )
{
   var a, b, c, t2, t3;

   t2 = t * t;
   t3 = t2 * t;

   c = 3 * ( x1 - x0 );
   b = 3 * ( x2 - x1 ) - c;
   a = x3 - x0 - c - b;

   return a * t3 + b * t2 + c * t + x0;
}


/*
======================================================================
bez2_time()

Find the t for which bezier() returns the input time.  The handle
endpoints of a BEZ2 curve represent the control points, and these have
(time, value) coordinates, so time is used as both a coordinate and a
parameter for this curve type.
====================================================================== */

function bez2_time( x0, x1, x2, x3, time, t0, t1 )
{
   var v, t;

   t = t0 + ( t1 - t0 ) * 0.5;
   v = bezier( x0, x1, x2, x3, t );
   if ( Math.abs( time - v ) > .0001 ) {
      if ( v > time )
         t1 = t;
      else
         t0 = t;
      return bez2_time( x0, x1, x2, x3, time, t0, t1 );
   }
   else
      return t;
}


/*
======================================================================
bez2()

Interpolate the value of a BEZ2 curve.
====================================================================== */

function bez2( key0, key1, time )
{
   var x, y, t, t0 = 0, t1 = 1;

   if ( key0.getShape() == eKeyframeShape_Bezier2D )
      x = key0.getTime() + key0.getParams(2);
   else
      x = key0.getTime() + ( key1.getTime() - key0.getTime() ) / 3;

   t = bez2_time( key0.getTime(), x, key1.getTime() + key1.getParams(0), key1.getTime(),
      time, t0, t1 );

   if ( key0.getShape() == eKeyframeShape_Bezier2D )
      y = key0.getValue() + key0.getParams(3);
   else
      y = key0.getValue() + key0.getParams(1) / 3;

   return bezier( key0.getValue(), y, key1.getParams(1) + key1.getValue(), key1.getValue(), t );
}


/*
======================================================================
outgoing()

Return the outgoing tangent to the curve at key0.  The value returned
for the BEZ2 case is used when extrapolating a linear pre behavior and
when interpolating a non-BEZ2 span.
====================================================================== */

function outgoing( keys, key0, key1, first )
{
   var a, b, d, t, out;

   switch ( key0.getShape() )
   {
      case eKeyframeShape.TCB:
         a = ( 1 - key0.getParams(0) )
           * ( 1 + key0.getParams(1) )
           * ( 1 + key0.getParams(2) );
         b = ( 1 - key0.getParams(0) )
           * ( 1 - key0.getParams(1) )
           * ( 1 - key0.getParams(2) );
         d = key1.getValue() - key0.getValue();

         if ( key0 != first ) {
            t = ( key1.getTime() - key0.getTime() ) / ( key1.getTime() - (keys.prev(key0)).getTime() );
            out = t * ( a * ( key0.getValue() - (keys.prev(key0)).getValue() ) + b * d );
         }
         else
            out = b * d;
         break;

      case eKeyframeShape.Linear:
         d = key1.getValue() - key0.getValue();
         if ( key0 != first ) {
            t = ( key1.getTime() - key0.getTime() ) / ( key1.getTime() - (keys.prev(key0)).getTime() );
            out = t * ( key0.getValue() - (keys.prev(key0)).getValue() + d );
         }
         else
            out = d;
         break;

      case eKeyframeShape.Bezier1D:
         out = key0.getParams(1);
         if ( key0 != first )
            out *= ( key1.getTime() - key0.getTime() ) / ( key1.getTime() - (keys.prev(key0)).getTime() );
         break;

      case eKeyframeShape.Bezier2D:
         out = key0.getParams(3) * ( key1.getTime() - key0.getTime() );
         if ( Math.abs( key0.getParams(2) ) > 1e-5 )
            out /= key0.getParams(2);
         else
            out *= 1e5;
         break;

      case eKeyframeShape.Stepped:
      default:
         out = 0;
         break;
   }

   return out;
}


/*
======================================================================
incoming()

Return the incoming tangent to the curve at key1.  The value returned
for the BEZ2 case is used when extrapolating a linear post behavior.
====================================================================== */

function incoming( keys, key0, key1, last )
{
   var a, b, d, t, _in;

   switch ( key1.getShape() )
   {
      case eKeyframeShape.Linear:
         d = key1.getValue() - key0.getValue();
         if ( key1 != last ) {
            t = ( key1.getTime() - key0.getTime() ) / ( (keys.next(key1)).getTime() - key0.getTime() );
            _in = t * ( (keys.next(key1)).getValue() - key1.getValue() + d );
         }
         else
            _in = d;
         break;

      case eKeyframeShape.TCB:
         a = ( 1 - key1.getParams(0) )
           * ( 1 - key1.getParams(1) )
           * ( 1 + key1.getParams(2) );
         b = ( 1 - key1.getParams(0) )
           * ( 1 + key1.getParams(1) )
           * ( 1 - key1.getParams(2) );
         d = key1.getValue() - key0.getValue();

         if ( key1 != last ) {
            t = ( key1.getTime() - key0.getTime() ) / ( (keys.next(key1)).getTime() - key0.getTime() );
            _in = t * ( b * ( (keys.next(key1)).getValue() - key1.getValue() ) + a * d );
         }
         else
            _in = a * d;
         break;

      case eKeyframeShape.Bezier1D:
         _in = key1.getParams(0);
         if ( key1 != last )
            _in *= ( key1.getTime() - key0.getTime() ) / ( (keys.next(key1)).getTime() - key0.getTime() );
         break;
         return _in;

      case eKeyframeShape.Bezier2D:
         _in = key1.getParams(1) * ( key1.getTime() - key0.getTime() );
         if ( Math.abs( key1.getParams(0) ) > 1e-5 )
            _in /= key1.getParams(0);
         else
            _in *= 1e5;
         break;

      case eKeyframeShape.Stepped:
      default:
         _in = 0;
         break;
   }

   return _in;
}


/*
======================================================================
interpolate()

Given a list of keys and a time number, returns the interpolated 
value at that time.
====================================================================== */

function interpolate(time, keyframes, first, last, preBehavior, postBehavior)
{
    // if no keys, the value is 0
    if (keyframes.length == 0)
    {
        return 0;
    }

    // if only one key, the value is constant
    if (keyframes.length == 1)
    {
        return first.getValue();
    }

    var noff = 0;
    var _in = 0;
    var out = 0;
    var offset = 0;
    var result;

    // use pre-behavior if time is before first key time
    if (time < first.getTime())
    {
        switch (preBehavior)
        {
        case eEndBehavior.Reset:
            return 0;

        case eEndBehavior.Constant:
            return first.getValue();

        case eEndBehavior.Repeat:
            result = range(time, first.getTime(), last.getTime());
            time = result.value;
            break;

        case eEndBehavior.Oscillate:
            result = range(time, first.getTime(), last.getTime());
            time = result.value;
            noff = result.i;
            if (noff % 2)
            {
                time = last.getTime() - first.getTime() - time;
            }
            break;

        case eEndBehavior.OffsetRepeat:
            result = range(time, first.getTime(), last.getTime());
            time = result.value;
            noff = result.i;
            offset = noff * (last.getValue() - first.getValue());
            break;

        case eEndBehavior.Linear:
            out = outgoing(keyframes, first, keyframes.next(first), first) / ((keyframes.next(first)).getTime() - first.getTime());
            return out * (time - first.getTime()) + first.getValue();
        }
    }
    // use post-behavior if time is after last key time
    else if (time > last.getTime())
    {
        switch (postBehavior)
        {
        case eEndBehavior.Reset:
            return 0;

        case eEndBehavior.Constant:
            return last.getValue();

        case eEndBehavior.Repeat:
            result = range(time, first.getTime(), last.getTime());
            time = result.value;
            break;

        case eEndBehavior.Oscillate:
            result = range(time, first.getTime(), last.getTime());
            time = result.value;
            noff = result.i;
            if (noff % 2)
            {
                time = last.getTime() - first.getTime() - time;
            }
            break;

        case eEndBehavior.OffsetRepeat:
            result = range(time, first.getTime(), last.getTime());
            time = result.value;
            noff = result.i;
            offset = noff * (last.getValue() - first.getValue());
            break;

        case eEndBehavior.Linear:
            _in = incoming(keyframes, keyframes.prev(last), last, last) / (last.getTime() - (keyframes.prev(last)).getTime());
            return _in * (time - last.getTime()) + last.getValue();
        }
    }

    // get the endpoints of the interval being evaluated 
    var key0 = first;
    while (keyframes.next(key0) && 
           time > (keyframes.next(key0)).getTime())
    {
        key0 = keyframes.next(key0);
    }
    var key1 = keyframes.next(key0);

    // check for singularities first 
    if (time == (key0).getTime())
    {
       return (key0).getValue() + offset;
    }
    else if (time == (key1).getTime())
    {
       return (key1).getValue() + offset;
    }

    // get interval length, time in [0, 1] 
    var t = (time - (key0).getTime()) / ((key1).getTime() - (key0).getTime());

    // interpolate 
    switch ((key1).getShape())
    {
    case eKeyframeShape.TCB:
    case eKeyframeShape.Bezier1D:
        {
            out = outgoing(keyframes, key0, key1, first);
            _in = incoming(keyframes, key0, key1, last);
            var result = hermite(t);
            return result.h1 * (key0).getValue() + result.h2 * (key1).getValue() + result.h3 * out + result.h4 * _in + offset;
        }

    case eKeyframeShape.Bezier2D:
        return bez2(key0, key1, time) + offset;

    case eKeyframeShape.Linear:
        return (key0).getValue() + t * ((key1).getValue() - (key0).getValue()) + offset;

    case eKeyframeShape.Stepped:
        return (key0).getValue() + offset;

    default:
        return 0;
    }

}