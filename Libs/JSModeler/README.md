JSModeler
=========

JSModeler is a JavaScript framework to create and visualize 3D models.

<a href="http://kovacsv.github.com/JSModeler/documentation/tutorial/tutorial.html">Tutorial</a> - 
<a href="http://kovacsv.github.com/JSModeler/documentation/jsmdoc/index.html">Reference</a> - 
<a href="https://github.com/kovacsv/JSModeler/wiki">Wiki</a> - 
<a href="http://kovacsv.github.com/JSModeler/documentation/demo/demonstration.html">Demo</a>

Useful links
------------
<ul>
	<li><a href="http://kovacsv.github.com/JSModeler/documentation/tutorial/minimal.html">JSModeler Minimal</a> is a minimalist example on using the framework.</li>
	<li>Documentation:
		<ul>
			<li><a href="http://kovacsv.github.com/JSModeler/documentation/tutorial/tutorial.html">JSModeler Tutorial</a> shows instructions and examples on how to use the framework.</li>
			<li><a href="http://kovacsv.github.com/JSModeler/documentation/jsmdoc/index.html">JSModeler Reference Manual</a> shows the reference manual for the framework.</li>
			<li><a href="http://kovacsv.github.com/JSModeler/documentation/tutorial/svgto3d.html">JSModeler SVG To 3D Tutorial</a> shows instructions on how to use SVG to 3D functionality.</li>
			<li><a href="http://kovacsv.github.com/JSModeler/documentation/reference/generator.html">JSModeler Generator Documentation</a> shows the usage of the built-in generator functions.</li>
		</ul>
	</li>
</ul>

Example applications
--------------------
<ul>
	<li><a href="http://kovacsv.github.com/JSModeler/documentation/demo/demonstration.html">JSModeler Generator Demonstration</a> is a page which contains examples for generator functions.</li>
	<li><a href="http://kovacsv.github.com/JSModeler/documentation/olddemo/demonstration.html">JSModeler Generator Demonstration (old version)</a> is a page which contains examples for generator functions.</li>
	<li><a href="http://kovacsv.github.com/JSModeler/documentation/olddemo/triangulation.html">JSModeler Triangulation Demonstration</a> is a page which demonstrates the built-in triangulation algorithm.</li>
	<li><a href="http://kovacsv.github.com/JSModeler/documentation/examples/legobuilder.html">Lego Builder</a> is an interactive lego builder application.</li>
	<li><a href="http://kovacsv.github.com/JSModeler/documentation/examples/tictactoe.html">3D Tic-Tac-Toe</a> is a Tic-Tac-Toe game with 3D interface.</li>
	<li><a href="http://kovacsv.github.com/JSModeler/documentation/examples/robot/robot.html">Robotic Arm</a> is a realtime robotic arm simulator.</li>
	<li><a href="http://kovacsv.github.com/JSModeler/documentation/examples/surfacepc.html">Surface Point Clouds</a> is an example of the point cloud viewer.</li>
	<li><a href="http://kovacsv.github.com/JSModeler/documentation/examples/csg.html">CSG Example</a> contains constructive solid geometry examples.</li>
	<li><a href="http://kovacsv.github.com/JSModeler/documentation/examples/svgto3d.html">SVGTo3D</a> contains examples of using SVG to model converter.</li>
	<li><a href="http://kovacsv.github.com/JSModeler/documentation/examples/bezier.html">Bezier Surface Generator</a> is an interactive surface generator.</li>
	<li><a href="http://kovacsv.github.com/JSModeler/documentation/examples/deform.html">Deform</a> is a realtime polygon soft selection tool.</li>
	<li><a href="http://kovacsv.github.com/JSModeler/documentation/examples/solids.html">Solid Body Viewer</a> is an example of using the SVG viewer.</li>
</ul>


Main capabilities
-----------------
<ul>
	<li>Simple 3D model building manually or with generator functions.</li>
	<ul>
		<li>We can define our model with adding vertices and polygons manually.</li>
		<li>We can use built-in generator functions to create basic shapes.</li>
	</ul>
	<li>Model import from 3DS, OBJ and STL format.</li>
	<li>Model export to OBJ and STL file format.</li>
	<li>Automatic conversion of SVG files to 3D models.</li>
	<li>Miscellaneous 2D and 3D geometry functions.</li>
	<ul>
		<li>Polygon triangulation for 2D and 3D polygons.</li>
		<li>Catmull-Clark subdivision for 3D bodies.</li>
		<li>Convex hull calculation for 2D and 3D point sets.</li>
	</ul>
	<li>Built-in Three.js based model viewer with rotation, pan and zoom functionality.</li>
	<li>Automatic conversion to Three.js geometry format.</li>
	<ul>
		<li>Convex and concave polygons are automatically triangulated during the conversion.</li>
		<li>Vertex normals automatically calculated for the curved polygons.</li>
	</ul>
</ul>
